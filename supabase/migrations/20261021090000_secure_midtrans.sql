-- Apply AFTER the existing application schema. Does not delete existing orders.
BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS access_token_hash text,
  ADD COLUMN IF NOT EXISTS checkout_request_id uuid,
  ADD COLUMN IF NOT EXISTS request_hash text,
  ADD COLUMN IF NOT EXISTS subtotal integer,
  ADD COLUMN IF NOT EXISTS discount integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS voucher_code text,
  ADD COLUMN IF NOT EXISTS payment_environment text,
  ADD COLUMN IF NOT EXISTS creation_state text DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS midtrans_transaction_status text,
  ADD COLUMN IF NOT EXISTS midtrans_transaction_id text,
  ADD COLUMN IF NOT EXISTS last_reconciled_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_verified_at timestamptz;

-- Both the migration-based schema and setup-new-project.sql are supported.
DO $$ DECLARE item record; BEGIN
  FOR item IN SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass AND contype = 'c'
    AND pg_get_constraintdef(oid) ~ '\mstatus\M'
  LOOP EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', item.conname); END LOOP;
END $$;
ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check
  CHECK (status IN ('pending','paid','expired','cancelled','failed','refunded','partially_refunded')) NOT VALID;
CREATE UNIQUE INDEX IF NOT EXISTS orders_checkout_request_id_key ON public.orders(checkout_request_id);

-- Remove ALL legacy permissive policies, including policies with misleading names.
DO $$ DECLARE item record; BEGIN
  FOR item IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='orders'
  LOOP EXECUTE format('DROP POLICY %I ON public.orders', item.policyname); END LOOP;
END $$;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.orders FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
CREATE POLICY "Payment admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE public.payment_vouchers (
  code text PRIMARY KEY CHECK (code = upper(code)),
  kind text NOT NULL CHECK (kind IN ('percent','fixed')),
  value integer NOT NULL CHECK (value > 0 AND (kind <> 'percent' OR value <= 100)),
  active boolean NOT NULL DEFAULT false,
  starts_at timestamptz,
  expires_at timestamptz,
  product_type text CHECK (product_type IN ('ebook','ecourse')),
  product_slug text
);
-- Dummy browser vouchers are intentionally not activated in the payment backend.

CREATE TABLE public.payment_rate_limits (
  key text PRIMARY KEY,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0
);

-- Private delivery configuration: paths never appear in public content JSON.
CREATE TABLE public.payment_assets (
  product_type text NOT NULL CHECK (product_type IN ('ebook','ecourse')),
  product_id text NOT NULL,
  bucket_id text NOT NULL DEFAULT 'paid-products',
  object_path text,
  drive_url text,
  active boolean NOT NULL DEFAULT true,
  PRIMARY KEY (product_type,product_id),
  CHECK ((object_path IS NOT NULL AND drive_url IS NULL) OR (object_path IS NULL AND drive_url IS NOT NULL))
);
CREATE TABLE public.payment_fulfillments (
  order_id text PRIMARY KEY REFERENCES public.orders(order_id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivered','revoked')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_fulfillments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_vouchers, public.payment_rate_limits, public.payment_assets, public.payment_fulfillments FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.payment_vouchers, public.payment_rate_limits, public.payment_assets, public.payment_fulfillments TO service_role;

INSERT INTO storage.buckets(id,name,public) VALUES ('paid-products','paid-products',false)
ON CONFLICT(id) DO UPDATE SET public=false;
UPDATE storage.buckets SET file_size_limit=52428800 WHERE id='paid-products';
-- No browser SELECT policy is added to storage.objects. Download runs on the backend.

CREATE FUNCTION public.payment_take_rate_limit(p_key text,p_limit integer,p_seconds integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE item public.payment_rate_limits;
BEGIN
  IF p_limit < 1 OR p_seconds < 1 OR p_seconds > 86400 THEN RAISE EXCEPTION 'invalid limit'; END IF;
  INSERT INTO public.payment_rate_limits(key) VALUES(p_key) ON CONFLICT DO NOTHING;
  SELECT * INTO item FROM public.payment_rate_limits WHERE key=p_key FOR UPDATE;
  IF item.window_started_at <= now()-make_interval(secs=>p_seconds) THEN
    UPDATE public.payment_rate_limits SET window_started_at=now(),attempts=1 WHERE key=p_key;
    RETURN true;
  END IF;
  IF item.attempts >= p_limit THEN RETURN false; END IF;
  UPDATE public.payment_rate_limits SET attempts=attempts+1 WHERE key=p_key;
  -- Bound retained limiter state without deleting active windows.
  DELETE FROM public.payment_rate_limits WHERE window_started_at < now()-interval '2 days';
  RETURN true;
END $$;

-- One reservation per request. Only the creator may call Snap; concurrent retries wait.
CREATE FUNCTION public.payment_reserve_order(
  p_request_id uuid,p_access_hash text,p_request_hash text,p_order_id text,
  p_name text,p_email text,p_phone text,p_type text,p_product_id text,p_product_name text,
  p_amount integer,p_subtotal integer,p_discount integer,p_voucher text,p_environment text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE item public.orders; fresh boolean := false;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_request_id::text,0));
  SELECT * INTO item FROM public.orders WHERE checkout_request_id=p_request_id;
  IF FOUND THEN
    IF item.access_token_hash IS DISTINCT FROM p_access_hash OR item.request_hash IS DISTINCT FROM p_request_hash THEN
      RETURN jsonb_build_object('conflict',true);
    END IF;
  ELSE
    IF p_amount <= 0 OR p_subtotal-p_discount <> p_amount OR p_environment NOT IN ('sandbox','production') THEN RAISE EXCEPTION 'invalid order'; END IF;
    INSERT INTO public.orders(order_id,checkout_request_id,access_token_hash,request_hash,
      customer_name,customer_email,customer_phone,product_type,product_id,product_name,
      amount,subtotal,discount,voucher_code,payment_environment,creation_state,status)
    VALUES(p_order_id,p_request_id,p_access_hash,p_request_hash,p_name,p_email,p_phone,p_type,p_product_id,p_product_name,
      p_amount,p_subtotal,p_discount,p_voucher,p_environment,'creating','pending') RETURNING * INTO item;
    fresh := true;
  END IF;
  RETURN jsonb_build_object('fresh',fresh,'order',to_jsonb(item));
END $$;

CREATE FUNCTION public.payment_apply_verified_status(
  p_order_id text,p_status text,p_amount integer,p_payment_method text,
  p_transaction_status text,p_transaction_id text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE item public.orders; next_status text;
BEGIN
  SELECT * INTO item FROM public.orders WHERE order_id=p_order_id FOR UPDATE;
  IF NOT FOUND OR item.amount <> p_amount THEN RAISE EXCEPTION 'order mismatch'; END IF;
  IF p_status NOT IN ('pending','paid','expired','cancelled','failed','refunded','partially_refunded') THEN RAISE EXCEPTION 'invalid status'; END IF;
  IF item.status IN ('paid','refunded','partially_refunded') AND item.midtrans_transaction_id IS NOT NULL AND p_transaction_id IS DISTINCT FROM item.midtrans_transaction_id THEN RAISE EXCEPTION 'transaction mismatch'; END IF;
  next_status := p_status;
  -- Refund is terminal; stale success/pending notifications cannot restore access.
  IF item.status='refunded' THEN next_status := 'refunded';
  ELSIF item.status='partially_refunded' AND p_status <> 'refunded' THEN next_status := 'partially_refunded';
  ELSIF item.status='paid' AND p_status NOT IN ('refunded','partially_refunded') THEN next_status := 'paid';
  ELSIF item.status IN ('expired','cancelled','failed') AND p_status='pending' THEN next_status := item.status;
  END IF;
  UPDATE public.orders SET status=next_status,
    payment_method=coalesce(p_payment_method,payment_method),
    paid_at=CASE WHEN next_status IN ('paid','partially_refunded','refunded') THEN coalesce(paid_at,now()) ELSE paid_at END,
    midtrans_transaction_status=CASE WHEN next_status=p_status THEN p_transaction_status ELSE midtrans_transaction_status END,
    midtrans_transaction_id=CASE WHEN item.status IN ('paid','refunded','partially_refunded') THEN coalesce(midtrans_transaction_id,p_transaction_id) ELSE p_transaction_id END,
    last_reconciled_at=now(), payment_verified_at=now()
  WHERE order_id=p_order_id;
  IF next_status='paid' THEN
    INSERT INTO public.payment_fulfillments(order_id) VALUES(p_order_id) ON CONFLICT DO NOTHING;
  ELSIF next_status IN ('refunded','partially_refunded') THEN
    UPDATE public.payment_fulfillments SET status='revoked',updated_at=now() WHERE order_id=p_order_id;
  END IF;
END $$;

REVOKE ALL ON FUNCTION public.payment_take_rate_limit(text,integer,integer) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.payment_reserve_order(uuid,text,text,text,text,text,text,text,text,text,integer,integer,integer,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.payment_apply_verified_status(text,text,integer,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.payment_take_rate_limit(text,integer,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.payment_reserve_order(uuid,text,text,text,text,text,text,text,text,text,integer,integer,integer,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.payment_apply_verified_status(text,text,integer,text,text,text) TO service_role;
COMMIT;
