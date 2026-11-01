-- ============================================================
-- Earning Streak (the /spin page)
--
-- Run this once in the Supabase SQL Editor, after schema.sql, security.sql and tiered_referrals.sql.
-- It is safe to run again. Until it has been run, the Earning Streak section simply stays hidden on /spin.
--
-- How it works: members earn a daily goal in coins from real offers (a UTC day, see lib/streak.js) and claim a
-- bonus for each day of the streak. The streak itself is worked out from completed_offers, so only the claims
-- need a table. One claim per user per day, enforced by the primary key.
-- ============================================================

-- 1. Claims: which days were already paid
CREATE TABLE IF NOT EXISTS public.streak_claims (
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day        DATE        NOT NULL,                 -- the UTC day whose goal was met
  day_no     INTEGER     NOT NULL CHECK (day_no >= 1), -- its number in the streak when it was claimed
  coins      INTEGER     NOT NULL CHECK (coins > 0),
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, day)
);

-- No policies on purpose: only the server (service role) reads and writes this table.
ALTER TABLE public.streak_claims ENABLE ROW LEVEL SECURITY;

-- 2. Coins earned from real offers per UTC day (spins do not count), newest day first.
CREATE OR REPLACE FUNCTION public.streak_daily_totals(p_user UUID, p_days INTEGER)
RETURNS TABLE (day DATE, coins BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (co.completed_at AT TIME ZONE 'UTC')::date AS day,
         COALESCE(SUM(co.coins_earned), 0)::bigint AS coins
  FROM public.completed_offers co
  WHERE co.user_id = p_user
    AND co.offer_id NOT IN ('daily_spin', 'signup_spin')
    AND (co.completed_at AT TIME ZONE 'UTC')::date
        >= ((now() AT TIME ZONE 'UTC')::date - GREATEST(p_days, 1))
  GROUP BY 1
  ORDER BY 1 DESC;
$$;

-- 3. Pay one day's bonus. The row lock and the primary key make a double claim impossible:
--    a second claim for the same day fails with unique_violation (23505) and changes nothing.
CREATE OR REPLACE FUNCTION public.claim_streak_day(p_user UUID, p_day DATE, p_day_no INTEGER, p_coins INTEGER)
RETURNS public.profiles
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prof public.profiles;
BEGIN
  IF p_coins IS NULL OR p_coins <= 0 THEN
    RAISE EXCEPTION 'streak_invalid_reward';
  END IF;

  SELECT * INTO prof FROM public.profiles WHERE id = p_user FOR UPDATE;
  IF NOT FOUND OR COALESCE(prof.is_banned, false) THEN
    RAISE EXCEPTION 'streak_unavailable';
  END IF;

  INSERT INTO public.streak_claims (user_id, day, day_no, coins)
  VALUES (p_user, p_day, p_day_no, p_coins);

  UPDATE public.profiles
  SET balance_coins = balance_coins + p_coins,
      total_earned_coins = total_earned_coins + p_coins
  WHERE id = p_user
  RETURNING * INTO prof;
  RETURN prof;
END;
$$;

REVOKE ALL ON FUNCTION public.streak_daily_totals(UUID, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_streak_day(UUID, DATE, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.streak_daily_totals(UUID, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_streak_day(UUID, DATE, INTEGER, INTEGER) TO service_role;
