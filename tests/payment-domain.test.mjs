import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { customerInput, productInput, credentials, priceAfterDiscount, verifiedStatus, validSignature, midtransEnvironment } from '../supabase/functions/_shared/payment-domain.ts';

test('server validates customer/product input and ignores client price', () => {
  assert.deepEqual(productInput({ productType: 'ebook', productId: 'reading-journal-2026', amount: 1, voucherCode: ' read10 ' }), { productType: 'ebook', productId: 'reading-journal-2026', voucherCode: 'READ10' });
  assert.throws(() => productInput({ productType: 'ebook', productId: 'foo,active.eq.false' }));
  assert.throws(() => productInput({ productType: 'physical', productId: 'book' }));
  assert.equal(customerInput({ customerName: ' Reza ', customerEmail: 'TEST@EXAMPLE.COM', customerPhone: '+628123456789' }).email, 'test@example.com');
  assert.throws(() => customerInput({ customerName: 'A', customerEmail: 'wrong' }));
  assert.throws(() => credentials({ accessToken: 'guess' }));
});
test('discount totals are authoritative positive integer rupiah', () => {
  assert.deepEqual(priceAfterDiscount(75000, { kind: 'percent', value: 10 }), { subtotal: 75000, discount: 7500, amount: 67500 });
  assert.equal(priceAfterDiscount(89000, { kind: 'fixed', value: 15000 }).amount, 74000);
  for (const price of [-1, 0, 1.2, NaN]) assert.throws(() => priceAfterDiscount(price, null));
  assert.throws(() => priceAfterDiscount(100, { kind: 'fixed', value: 100 }));
  assert.throws(() => priceAfterDiscount(100, { kind: 'percent', value: 101 }));
});
test('Snap mode fails closed for missing/mismatched keys', () => {
  assert.equal(midtransEnvironment('sandbox', 'SB-server', 'SB-client').snapApi, 'https://app.sandbox.midtrans.com/snap/v1/transactions');
  assert.equal(midtransEnvironment('production', 'server', 'client').snapUrl, 'https://app.midtrans.com/snap/snap.js');
  assert.throws(() => midtransEnvironment('sandbox', 'SB-server', 'client'));
  assert.throws(() => midtransEnvironment('production', 'SB-server', 'client'));
  assert.throws(() => midtransEnvironment('', '', ''));
});
test('signature includes original amount formatting and rejects forged signatures', async () => {
  const body = { order_id: 'SL-test', status_code: '200', gross_amount: '75000.00' };
  const signature_key = createHash('sha512').update('SL-test20075000.00unit-test-key').digest('hex');
  assert.equal(await validSignature({ ...body, signature_key }, 'unit-test-key'), true);
  assert.equal(await validSignature({ ...body, gross_amount: '75000', signature_key }, 'unit-test-key'), false);
  assert.equal(await validSignature({ ...body, signature_key: 'a'.repeat(128) }, 'unit-test-key'), false);
  assert.equal(await validSignature({ ...body, signature_key: '' }, 'unit-test-key'), false);
});
test('only verified success with accepted fraud status grants paid; refunds revoke', () => {
  const base = { currency: 'IDR', status_code: '200' };
  assert.equal(verifiedStatus({ ...base, transaction_status: 'capture', fraud_status: 'accept' }), 'paid');
  assert.equal(verifiedStatus({ ...base, transaction_status: 'capture', fraud_status: 'challenge' }), null);
  assert.equal(verifiedStatus({ ...base, transaction_status: 'settlement', status_code: '500' }), null);
  assert.equal(verifiedStatus({ ...base, transaction_status: 'partial_refund' }), 'partially_refunded');
  assert.equal(verifiedStatus({ ...base, transaction_status: 'refund' }), 'refunded');
  assert.equal(verifiedStatus({ ...base, transaction_status: 'unexpected' }), null);
  assert.throws(() => verifiedStatus({ ...base, currency: 'USD', transaction_status: 'settlement' }));
});
