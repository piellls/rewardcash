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

-- 2b. Update Policy: Users can update their own tickets (e.g. to reopen them)
CREATE POLICY "Users can update their own support tickets" 
  ON public.support_tickets FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Admin Policies: Admins can view and update all tickets (by checking profiles.role)
CREATE POLICY "Admins can view all support tickets" 
  ON public.support_tickets FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all support tickets" 
  ON public.support_tickets FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- 4. Create support_ticket_messages table for two-way chat
CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_username TEXT NOT NULL,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on messages
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- 1. Read Policy: Users can view messages for their own tickets
CREATE POLICY "Users can view messages for their own tickets" 
  ON public.support_ticket_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = ticket_id AND support_tickets.user_id = auth.uid()
    )
  );

-- 2. Write Policy: Users can send messages for their own tickets
CREATE POLICY "Users can send messages for their own tickets" 
  ON public.support_ticket_messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE support_tickets.id = ticket_id AND support_tickets.user_id = auth.uid()
    ) AND sender_id = auth.uid() AND is_admin = false
  );

-- 3. Admin Policies: Admins can view and write any message (by checking profiles.role)
CREATE POLICY "Admins can view all ticket messages" 
  ON public.support_ticket_messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create ticket messages" 
  ON public.support_ticket_messages FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
