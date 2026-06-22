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

-- 3. Admin Policy: Admins can view and update all tickets
-- We will handle admin access in code using service role,
-- or we can write an RLS policy if we want, but since RLS is bypassed by service role (used in admin route/calls),
-- this is already fully secure.
