-- Support Tickets Schema (Run this in the Supabase SQL Editor)

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: Users can view their own tickets
CREATE POLICY "Users can view their own support tickets" 
  ON public.support_tickets FOR SELECT 
  USING (auth.uid() = user_id);

-- 2. Write Policy: Users can create their own tickets
CREATE POLICY "Users can create their own support tickets" 
  ON public.support_tickets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 3. Admin Policies: Admins can view and update all tickets
CREATE POLICY "Admins can view all support tickets" 
  ON public.support_tickets FOR SELECT 
  USING (
    auth.jwt() ->> 'email' = 'admin@rewardcash.co' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins can update all support tickets" 
  ON public.support_tickets FOR UPDATE 
  USING (
    auth.jwt() ->> 'email' = 'admin@rewardcash.co' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    auth.jwt() ->> 'email' = 'admin@rewardcash.co' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
