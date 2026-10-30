-- Tiered referral commission (5% to 15%) for BlueberryCash.
-- Run this ONCE in the Supabase SQL Editor, BEFORE merging the matching code. It is safe to re-run.
-- The old code keeps working after it is applied (it just still says "10%" on the page).
--
-- How it works
--   * Every completed offer of a referred friend is added to the referrer's total for the current calendar
--     month (UTC) in referral_monthly.
--   * The rate comes from that month total (the ladder in referral_rate below, thresholds in coins, 1,000 coins = $1).
--   * The referrer is owed rate x month total. Each completion pays whatever is still owed, so when a friend's
--     offer lifts the total to a higher step, the earlier offers of the month are topped up to the new rate.
--     At any moment the month's commission = month total x current rate, exactly what the calculator shows.
--   * The 100 coin bonus for a friend's first real offer is unchanged and is not part of the month total.
--   * Everyone starts at the lowest step on the 1st of each month. This migration starts the first month from zero:
--     offers completed before it ran were already paid at the old flat 10%.
--
-- Keep the ladder in sync with lib/affiliate.js (same steps; there they are in dollars).

-- ============================================================
-- 1. Month totals
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referral_monthly (
  referrer_id   UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month         DATE   NOT NULL,                 -- first day of the month, UTC
  friends_coins BIGINT NOT NULL DEFAULT 0,       -- what the referrer's friends earned from offers that month
  paid_coins    BIGINT NOT NULL DEFAULT 0,       -- commission already paid to the referrer for that month
  PRIMARY KEY (referrer_id, month)
);

ALTER TABLE public.referral_monthly ENABLE ROW LEVEL SECURITY;

-- A referrer can read their own totals (the Referrals page). Only credit_offer (service role) writes them.
DROP POLICY IF EXISTS "Referrers can view their own monthly totals" ON public.referral_monthly;
CREATE POLICY "Referrers can view their own monthly totals"
  ON public.referral_monthly FOR SELECT USING (referrer_id = auth.uid());

REVOKE ALL ON public.referral_monthly FROM anon, authenticated;
GRANT SELECT ON public.referral_monthly TO authenticated;

-- ============================================================
-- 2. The ladder
-- ============================================================
CREATE OR REPLACE FUNCTION public.referral_rate(p_friends_coins BIGINT)
RETURNS INTEGER
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_friends_coins >= 5000000 THEN 15   -- $5,000
    WHEN p_friends_coins >= 3500000 THEN 14   -- $3,500
    WHEN p_friends_coins >= 2000000 THEN 13   -- $2,000
    WHEN p_friends_coins >= 1200000 THEN 12   -- $1,200
    WHEN p_friends_coins >=  700000 THEN 10   -- $700
    WHEN p_friends_coins >=  400000 THEN 9    -- $400
    WHEN p_friends_coins >=  200000 THEN 8    -- $200
    WHEN p_friends_coins >=  100000 THEN 7    -- $100
    WHEN p_friends_coins >=   50000 THEN 6    -- $50
    ELSE 5
  END;
$$;

-- ============================================================
-- 3. credit_offer: same as before, but the referrer's share follows the ladder
--    Returns: ok | duplicate | banned | no_user
-- ============================================================
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
  v_month DATE;
  v_volume BIGINT;
  v_paid BIGINT;
  v_commission INTEGER;
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

  IF v_ref IS NOT NULL THEN
    v_month := date_trunc('month', timezone('utc', now()))::date;

    -- Add this offer to the month total. The row lock this takes also makes two friends' offers
    -- for the same referrer count one after the other.
    INSERT INTO public.referral_monthly (referrer_id, month, friends_coins)
    VALUES (v_ref, v_month, p_coins)
    ON CONFLICT (referrer_id, month)
    DO UPDATE SET friends_coins = public.referral_monthly.friends_coins + EXCLUDED.friends_coins
    RETURNING friends_coins, paid_coins INTO v_volume, v_paid;

    -- Owed for the month at the current step, minus what was already paid. Never negative.
    v_commission := GREATEST(
      0,
      floor(v_volume * public.referral_rate(v_volume) / 100.0)::bigint - v_paid
    )::integer;

    UPDATE public.referral_monthly
    SET paid_coins = paid_coins + v_commission
    WHERE referrer_id = v_ref AND month = v_month;

    -- Plus the one-time 100 coin bonus when the friend finishes their FIRST real offer
    -- (not at sign-up, so fake accounts earn nothing).
    v_referrer_coins := v_commission + CASE WHEN v_first THEN 100 ELSE 0 END;
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

REVOKE ALL ON FUNCTION public.credit_offer(UUID, TEXT, TEXT, TEXT, NUMERIC, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.credit_offer(UUID, TEXT, TEXT, TEXT, NUMERIC, INTEGER) TO service_role;
