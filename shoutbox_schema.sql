-- Shoutbox Database Schema (Run this in the Supabase SQL Editor)

CREATE TABLE IF NOT EXISTS public.shoutbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  message TEXT NOT NULL CHECK (char_length(message) <= 250),
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.shoutbox_messages ENABLE ROW LEVEL SECURITY;

-- Read policy: Anyone can read messages
CREATE POLICY "Shoutbox messages are readable by everyone" 
  ON public.shoutbox_messages FOR SELECT 
  USING (true);

-- Write policy: Only authenticated users can send messages
CREATE POLICY "Authenticated users can post shoutbox messages" 
  ON public.shoutbox_messages FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
