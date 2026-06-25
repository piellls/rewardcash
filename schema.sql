-- Supabase Schema for RewardCash Clone
-- Run this in the Supabase SQL Editor

-- 1. Create a table for public profiles (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  balance_coins INTEGER DEFAULT 0 CHECK (balance_coins >= 0),
  total_earned_coins INTEGER DEFAULT 0 CHECK (total_earned_coins >= 0),
  avatar_url TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Profiles
-- Allow users to read any profile (for leaderboard)
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Create completed_offers table
CREATE TABLE IF NOT EXISTS public.completed_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offer_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- e.g., 'cpalead', 'adgate'
  payout_usd NUMERIC(10, 4) NOT NULL,
  coins_earned INTEGER NOT NULL,
  click_id TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.completed_offers ENABLE ROW LEVEL SECURITY;

-- Users can view their own completed offers
CREATE POLICY "Users can view their own completed offers" 
  ON public.completed_offers FOR SELECT 
  USING (auth.uid() = user_id);

-- 3. Create withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_usd NUMERIC(10, 2) NOT NULL,
  coins_spent INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- e.g., 'paypal', 'ltc', 'btc'
  payment_address TEXT NOT NULL, -- e.g., email or wallet address
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Users can view their own withdrawals
CREATE POLICY "Users can view their own withdrawals" 
  ON public.withdrawals FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own withdrawals
CREATE POLICY "Users can create their own withdrawals" 
  ON public.withdrawals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 4. Trigger to automatically create a profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
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

  INSERT INTO public.profiles (id, username, email, balance_coins, total_earned_coins, device_fingerprint)
  VALUES (
    new.id,
    v_username,
    new.email,
    0,
    0,
    new.raw_user_meta_data->>'device_fingerprint'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
