import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

async function database() {
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA storage;
    CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint);
    CREATE FUNCTION public.is_admin() RETURNS boolean LANGUAGE sql AS $$ SELECT coalesce(current_setting('test.is_admin',true),'false')='true' $$;`);
  await db.exec(await readFile(new URL('../supabase/migrations/20260104150640_59f682b5-bdb5-4cce-afbb-37c530511bfe.sql', import.meta.url), 'utf8'));
  await db.exec(`GRANT SELECT,INSERT,UPDATE ON public.orders TO anon,authenticated;
    INSERT INTO public.orders(order_id,customer_name,customer_email,product_type,product_id,product_name,amount,status) VALUES ('legacy-order','Buyer','buyer@example.test','ebook','old','Old book',75000,'paid');`);
  await db.exec(await readFile(new URL('../supabase/migrations/20261021090000_secure_midtrans.sql', import.meta.url), 'utf8'));
  return db;
}
const id = 'SL-11111111-1111-4111-8111-111111111111';
async function reserve(db, access = 'a'.repeat(64), requestHash = 'b'.repeat(64)) {
  const { rows } = await db.query(`SELECT public.payment_reserve_order($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) AS result`, ['11111111-1111-4111-8111-111111111111', access, requestHash, id, 'Buyer', 'buyer@example.test', null, 'ebook', 'product-one', 'Book', 67500, 75000, 7500, 'READ10', 'sandbox']);
  return rows[0].result;
}
async function apply(db, status, amount = 67500, transactionId = 'midtrans-one') {
  return db.query(`SELECT public.payment_apply_verified_status($1,$2,$3,$4,$5,$6)`, [id, status, amount, 'bank_transfer', status === 'paid' ? 'settlement' : status, transactionId]);
}

test('migration preserves old orders and restricts reads/writes and RPCs', async () => {
  const db = await database();
  try {
    assert.equal((await db.query("SELECT status FROM orders WHERE order_id='legacy-order'")).rows[0].status, 'paid');
    await db.exec('SET ROLE anon');
    await assert.rejects(db.query('SELECT * FROM orders'), /permission denied/);
    await assert.rejects(db.query("INSERT INTO orders(order_id) VALUES('fake')"), /permission denied/);
    await assert.rejects(db.query("SELECT payment_take_rate_limit('fake',1,60)"), /permission denied/);
    await db.exec('RESET ROLE; SET ROLE authenticated');
    assert.equal((await db.query('SELECT * FROM orders')).rows.length, 0);
    await assert.rejects(db.query("UPDATE orders SET status='paid'"), /permission denied/);
    await db.exec("SET test.is_admin='true'");
    assert.equal((await db.query('SELECT * FROM orders')).rows.length, 1);
    await db.exec('RESET ROLE; SET ROLE service_role');
    assert.equal((await db.query('SELECT * FROM orders')).rows.length, 1);
    await db.exec('RESET ROLE');
    assert.equal((await db.query("SELECT public FROM storage.buckets WHERE id='paid-products'")).rows[0].public, false);
  } finally { await db.close(); }
});
test('reservation is idempotent and rejects changed credential/body', async () => {
  const db = await database();
  try {
    const results = await Promise.all([reserve(db),reserve(db)]);
    assert.equal(results.filter((result) => result.fresh).length, 1);
    assert.equal((await reserve(db, 'c'.repeat(64))).conflict, true);
    assert.equal((await reserve(db, 'a'.repeat(64), 'd'.repeat(64))).conflict, true);
    assert.equal((await db.query('SELECT * FROM orders WHERE checkout_request_id IS NOT NULL')).rows.length, 1);
  } finally { await db.close(); }
});
test('verified updates preserve paid state, avoid duplicate delivery, and revoke refunds', async () => {
  const db = await database();
  try {
    await reserve(db); await apply(db, 'pending', 67500, 'first-payment-method'); await apply(db, 'paid');
    const paidAt = (await db.query('SELECT paid_at FROM orders WHERE order_id=$1',[id])).rows[0].paid_at;
    await apply(db, 'paid'); await apply(db, 'pending'); await apply(db, 'expired');
    const row = (await db.query('SELECT status,paid_at FROM orders WHERE order_id=$1',[id])).rows[0];
    assert.equal(row.status, 'paid'); assert.deepEqual(row.paid_at, paidAt);
    assert.equal((await db.query('SELECT * FROM payment_fulfillments')).rows.length, 1);
    await assert.rejects(apply(db, 'paid', 1), /order mismatch/);
    await assert.rejects(apply(db, 'paid', 67500, 'different-transaction'), /transaction mismatch/);
    await apply(db, 'partially_refunded'); await apply(db, 'paid');
    assert.equal((await db.query('SELECT status FROM orders WHERE order_id=$1',[id])).rows[0].status, 'partially_refunded');
    await apply(db, 'refunded'); await apply(db, 'paid');
    assert.equal((await db.query('SELECT status FROM orders WHERE order_id=$1',[id])).rows[0].status, 'refunded');
    assert.equal((await db.query('SELECT status FROM payment_fulfillments')).rows[0].status, 'revoked');
  } finally { await db.close(); }
});
test('database rate quota is shared and expires', async () => {
  const db = await database();
  try {
    const take = async () => (await db.query("SELECT payment_take_rate_limit('test-key',2,60) AS allowed")).rows[0].allowed;
    assert.equal(await take(),true); assert.equal(await take(),true); assert.equal(await take(),false);
    await db.exec("UPDATE payment_rate_limits SET window_started_at=now()-interval '61 seconds'");
    assert.equal(await take(),true);
  } finally { await db.close(); }
});
