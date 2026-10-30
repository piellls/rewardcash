-- Security hardening for BlueberryCash.
-- Run this ONCE in the Supabase SQL Editor, BEFORE deploying the matching code.
-- It is safe to re-run. The old code keeps working after it is applied.

-- ============================================================
-- 0. Helpers
-- ============================================================

-- True when the signed-in user is an admin. SECURITY DEFINER so it can be used
-- inside policies on "profiles" without recursing into those policies.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- The admin is set here, once, in the database. The browser can no longer promote itself.
UPDATE public.profiles SET role = 'admin' WHERE lower(email) = 'xpilalhamlawe@gmail.com';

-- ============================================================
-- 1. profiles: users may only change harmless columns of their own row
--    (stops people from editing balance_coins, role, is_banned from the browser)
-- ============================================================
REVOKE UPDATE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (username, email, avatar_url, device_fingerprint, country)
  ON public.profiles TO authenticated;

-- ============================================================
-- 2. profiles: stop exposing every user's email / fingerprint to everyone
-- ============================================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Referrers can view their referred users" ON public.profiles;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT USING (public.is_admin());

-- The referrals page lists the people a user invited (username, join date, earnings).
CREATE POLICY "Referrers can view their referred users"
  ON public.profiles FOR SELECT USING (referred_by = auth.uid());

-- ============================================================
-- 3. withdrawals: only the server (service role) may create them
-- ============================================================
DROP POLICY IF EXISTS "Users can create their own withdrawals" ON public.withdrawals;

-- ============================================================
-- 4. completed_offers: one row per network transaction (blocks double credit)
-- ============================================================
ALTER TABLE public.completed_offers ADD COLUMN IF NOT EXISTS transaction_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS completed_offers_provider_txn_uniq
  ON public.completed_offers (provider, transaction_id)
  WHERE transaction_id IS NOT NULL;

-- ============================================================
-- 5. Atomic money functions. Each one runs as a single transaction, so two
--    requests at the same moment can no longer both pass a stale balance check.
--    Only the server (service role) may call them.
-- ============================================================

-- Credit an offer completion. Returns: ok | duplicate | banned | no_user
CREATE OR REPLACE FUNCTION public.credit_offer(
  p_user UUID, p_provider TEXT, p_offer_id TEXT, p_txn TEXT, p_payout NUMERIC, p_coins INTEGER
) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ref UUID;
  v_banned BOOLEAN;
  v_first BOOLEAN;
  v_referrer_coins INTEGER;
BEGIN
  -- Row lock: concurrent postbacks for the same user wait here.
  SELECT referred_by, COALESCE(is_banned, false) INTO v_ref, v_banned
  FROM public.profiles WHERE id = p_user FOR UPDATE;
  IF NOT FOUND THEN RETURN 'no_user'; END IF;
  IF v_banned THEN RETURN 'banned'; END IF;

  SELECT NOT EXISTS (
    SELECT 1 FROM public.completed_offers
    WHERE user_id = p_user AND offer_id NOT IN ('daily_spin', 'signup_spin')
  ) INTO v_first;

  BEGIN
    INSERT INTO public.completed_offers (user_id, offer_id, provider, payout_usd, coins_earned, click_id, transaction_id)
    VALUES (p_user, p_offer_id, p_provider, p_payout, p_coins, p_user::text, p_txn);
  EXCEPTION WHEN unique_violation THEN
    RETURN 'duplicate';
  END;

  UPDATE public.profiles
  SET balance_coins = balance_coins + p_coins,
      total_earned_coins = total_earned_coins + p_coins
  WHERE id = p_user;

  -- Referrer gets 10% of every completion, plus a one-time 100 coin bonus when the
  -- invited friend finishes their FIRST real offer (not at sign-up, so fake accounts earn nothing).
  IF v_ref IS NOT NULL THEN
    v_referrer_coins := floor(p_coins * 0.10)::integer + CASE WHEN v_first THEN 100 ELSE 0 END;
    IF v_referrer_coins > 0 THEN
      UPDATE public.profiles
      SET balance_coins = balance_coins + v_referrer_coins,
          total_earned_coins = total_earned_coins + v_referrer_coins,
          referral_earnings_total = COALESCE(referral_earnings_total, 0) + v_referrer_coins
      WHERE id = v_ref;
    END IF;
  END IF;

  RETURN 'ok';
END;
$$;

-- Take coins and create the withdrawal together, or do neither.
CREATE OR REPLACE FUNCTION public.create_withdrawal(
  p_user UUID, p_coins INTEGER, p_amount NUMERIC, p_method TEXT, p_address TEXT
) RETURNS public.withdrawals
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w public.withdrawals;
BEGIN
  UPDATE public.profiles
  SET balance_coins = balance_coins - p_coins
  WHERE id = p_user AND balance_coins >= p_coins AND NOT COALESCE(is_banned, false);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'insufficient_balance_or_banned';
  END IF;

  INSERT INTO public.withdrawals (user_id, amount_usd, coins_spent, payment_method, payment_address, status)
  VALUES (p_user, p_amount, p_coins, p_method, p_address, 'pending')
  RETURNING * INTO w;
  RETURN w;
END;
$$;

-- Approve or reject a pending withdrawal. Rejecting refunds the coins. Can only happen once.
CREATE OR REPLACE FUNCTION public.resolve_withdrawal(p_id UUID, p_status TEXT)
RETURNS public.withdrawals
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w public.withdrawals;
BEGIN
  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;

  UPDATE public.withdrawals
  SET status = p_status, updated_at = timezone('utc'::text, now())
  WHERE id = p_id AND status = 'pending'
  RETURNING * INTO w;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_pending';
  END IF;

  IF p_status = 'rejected' THEN
    UPDATE public.profiles SET balance_coins = balance_coins + w.coins_spent WHERE id = w.user_id;
  END IF;
  RETURN w;
END;
$$;

-- Daily spin: the 24h check and the payout happen in one statement.
CREATE OR REPLACE FUNCTION public.claim_daily_spin(p_user UUID, p_coins INTEGER)
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof public.profiles;
BEGIN
  UPDATE public.profiles
  SET balance_coins = balance_coins + p_coins,
      total_earned_coins = total_earned_coins + p_coins,
      last_daily_spin_at = now()
  WHERE id = p_user
    AND NOT COALESCE(is_banned, false)
    AND (last_daily_spin_at IS NULL OR last_daily_spin_at <= now() - interval '24 hours')
  RETURNING * INTO prof;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'daily_spin_unavailable';
  END IF;

  INSERT INTO public.completed_offers (user_id, offer_id, provider, payout_usd, coins_earned)
  VALUES (p_user, 'daily_spin', 'system_spin', p_coins / 1000.0, p_coins);
  RETURN prof;
END;
$$;

-- Sign-up spins: p_allowed is how many the user may claim in total (server works it out).
CREATE OR REPLACE FUNCTION public.claim_signup_spin(p_user UUID, p_coins INTEGER, p_allowed INTEGER)
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof public.profiles;
  v_claimed INTEGER;
BEGIN
  SELECT * INTO prof FROM public.profiles WHERE id = p_user FOR UPDATE;
  IF NOT FOUND OR COALESCE(prof.is_banned, false) THEN
    RAISE EXCEPTION 'signup_spin_unavailable';
  END IF;

  SELECT count(*) INTO v_claimed FROM public.completed_offers
  WHERE user_id = p_user AND offer_id = 'signup_spin';
  IF v_claimed >= p_allowed THEN
    RAISE EXCEPTION 'signup_spin_unavailable';
  END IF;

  UPDATE public.profiles
  SET balance_coins = balance_coins + p_coins,
      total_earned_coins = total_earned_coins + p_coins,
      has_claimed_signup_bonus = (v_claimed + 1 >= p_allowed)
  WHERE id = p_user
  RETURNING * INTO prof;

  INSERT INTO public.completed_offers (user_id, offer_id, provider, payout_usd, coins_earned)
  VALUES (p_user, 'signup_spin', 'system_spin', p_coins / 1000.0, p_coins);
  RETURN prof;
END;
$$;

-- Admin balance change without read-then-write.
CREATE OR REPLACE FUNCTION public.admin_adjust_balance(p_user UUID, p_amount INTEGER)
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof public.profiles;
BEGIN
  UPDATE public.profiles
  SET balance_coins = GREATEST(0, balance_coins + p_amount),
      total_earned_coins = total_earned_coins + GREATEST(p_amount, 0)
  WHERE id = p_user
  RETURNING * INTO prof;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;
  RETURN prof;
END;
$$;

REVOKE ALL ON FUNCTION public.credit_offer(UUID, TEXT, TEXT, TEXT, NUMERIC, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_withdrawal(UUID, INTEGER, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.resolve_withdrawal(UUID, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_daily_spin(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_signup_spin(UUID, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_adjust_balance(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credit_offer(UUID, TEXT, TEXT, TEXT, NUMERIC, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_withdrawal(UUID, INTEGER, NUMERIC, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.resolve_withdrawal(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_daily_spin(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_signup_spin(UUID, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_adjust_balance(UUID, INTEGER) TO service_role;

-- ============================================================
-- 6. Referral bonus: no more free coins at sign-up
--    (the bonus is now paid by credit_offer after the friend's first real offer)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_referred_by_code TEXT;
  v_referred_by_id UUID := NULL;
BEGIN
  v_username := COALESCE((new.raw_user_meta_data->>'username'), SPLIT_PART(new.email, '@', 1));

  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) THEN
    v_username := v_username || '_' || floor(random() * 10000)::text;
  END IF;

  v_referred_by_code := new.raw_user_meta_data->>'referred_by';
  IF v_referred_by_code IS NOT NULL AND v_referred_by_code <> '' THEN
    SELECT id INTO v_referred_by_id FROM public.profiles
    WHERE username = v_referred_by_code OR referral_code = LOWER(v_referred_by_code) OR id::text = v_referred_by_code
    LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, username, email, balance_coins, total_earned_coins, device_fingerprint, country, referred_by, referral_code, referral_earnings_total)
  VALUES (
    new.id, v_username, new.email, 100, 100,
    new.raw_user_meta_data->>'device_fingerprint',
    COALESCE(new.raw_user_meta_data->>'country', 'Unknown'),
    v_referred_by_id, LOWER(v_username), 0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
