-- Referral Program Database Updates (Run this in the Supabase SQL Editor)

-- 1. Add referral columns to profiles table if they do not exist
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referral_earnings_total INTEGER DEFAULT 0 CHECK (referral_earnings_total >= 0);

-- Populate referral_code for existing users (defaults to lowercased username)
UPDATE public.profiles 
SET referral_code = LOWER(username) 
WHERE referral_code IS NULL;

-- 2. Update new user trigger to award signup bonuses and bind referrers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_referred_by_code TEXT;
  v_referred_by_id UUID := NULL;
  v_starting_balance INTEGER := 0;
BEGIN
  -- Try to get username from metadata, default to split email
  v_username := COALESCE(
    (new.raw_user_meta_data->>'username'), 
    SPLIT_PART(new.email, '@', 1)
  );
  
  -- Ensure username is unique by appending random numbers if needed
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = v_username) THEN
    v_username := v_username || '_' || floor(random() * 10000)::text;
  END IF;

  -- Try to find referrer ID from metadata (which contains referrer's username or code)
  v_referred_by_code := new.raw_user_meta_data->>'referred_by';
  IF v_referred_by_code IS NOT NULL AND v_referred_by_code <> '' THEN
    SELECT id INTO v_referred_by_id FROM public.profiles 
    WHERE username = v_referred_by_code OR referral_code = LOWER(v_referred_by_code) OR id::text = v_referred_by_code
    LIMIT 1;
    
    IF v_referred_by_id IS NOT NULL THEN
      v_starting_balance := 100; -- Award 100 welcome coins to new user
      
      -- Award 250 coins signup bonus to referrer
      UPDATE public.profiles 
      SET balance_coins = balance_coins + 250,
          total_earned_coins = total_earned_coins + 250,
          referral_earnings_total = referral_earnings_total + 250
      WHERE id = v_referred_by_id;
    END IF;
  END IF;

  INSERT INTO public.profiles (id, username, email, balance_coins, total_earned_coins, referred_by, referral_code, referral_earnings_total)
  VALUES (
    new.id,
    v_username,
    new.email,
    v_starting_balance,
    v_starting_balance,
    v_referred_by_id,
    LOWER(v_username),
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger (to ensure it uses the updated function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
