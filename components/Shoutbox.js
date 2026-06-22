'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db, isMockMode, supabase } from '@/lib/db';
import { Send, MessageSquare, AlertCircle, Loader2, Sparkles, Shield } from 'lucide-react';

export default function Shoutbox() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!isMockMode && supabase) {
      try {
        const { data, error: fetchErr } = await supabase
          .from('shoutbox_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(30);

        if (fetchErr) throw fetchErr;
        // Reverse to show in chronological order
        setMessages((data || []).reverse());
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    } else {
      // Mock mode initialization
      const mockChat = JSON.parse(localStorage.getItem('rc_shoutbox') || '[]');
      if (mockChat.length === 0) {
        const initialMock = [
          { id: 'm1', username: 'CoinKing', message: 'Yo! Just cashed out $10 to PayPal.', role: 'user', created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: 'm2', username: 'pilal', message: 'Welcome to RewardCash shoutbox! Chat is live.', role: 'admin', created_at: new Date(Date.now() - 3000000).toISOString() },
          { id: 'm3', username: 'EarnMaster', message: 'Which game is the easiest to complete?', role: 'user', created_at: new Date(Date.now() - 1800000).toISOString() },
          { id: 'm4', username: 'TaskSlayer', message: 'Board Kings is super fast, took me 1 hour.', role: 'user', created_at: new Date(Date.now() - 600000).toISOString() }
        ];
        localStorage.setItem('rc_shoutbox', JSON.stringify(initialMock));
        setMessages(initialMock);
      } else {
        setMessages(mockChat);
      }
    }
  };

  useEffect(() => {
    loadMessages();

    // 1. Supabase Realtime Subscription
    let channel;
    if (!isMockMode && supabase) {
      channel = supabase
        .channel('shoutbox-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'shoutbox_messages' },
          (payload) => {
            setMessages((prev) => {
              // Ensure we don't add duplicate messages (e.g. if insert returns local state too)
              if (prev.some((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new].slice(-30);
            });
          }
        )
        .subscribe();
    }

    // 2. Mock mode message generator (ticker)
    let mockInterval;
    if (isMockMode) {
      mockInterval = setInterval(() => {
        const randomNames = ['Sofia', 'Sarah', 'Mehdi', 'Anass', 'Fatima', 'Omar', 'Karim', 'Lina'];
        const randomMessages = [
          'Wow, just completed opinion world survey for 1200 coins!',
          'Litecoin payout is so fast, received in 5 minutes.',
          'Is there any new promo code active today?',
          'Anyone completed Lords Mobile? Need tips.',
          'Just reached 5000 coins, time to withdraw!',
          'This is definitely the best GPT site.',
          'Daily checkin bonus claimed, 3-day streak!',
          'Hey guys, how long does PayPal payout take?'
        ];
        
        const newMsg = {
          id: `m_${Math.random()}`,
          username: randomNames[Math.floor(Math.random() * randomNames.length)],
          message: randomMessages[Math.floor(Math.random() * randomMessages.length)],
          role: 'user',
          created_at: new Date().toISOString()
        };

        setMessages((prev) => {
          const updated = [...prev, newMsg].slice(-30);
          localStorage.setItem('rc_shoutbox', JSON.stringify(updated));
          return updated;
        });
      }, 15000); // Send fake chat message every 15 seconds
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (mockInterval) clearInterval(mockInterval);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user) {
      setError('You must be logged in to send a message.');
      return;
    }
    
    const msgText = input.trim();
    if (!msgText) return;
    if (msgText.length > 250) {
      setError('Message is too long (max 250 characters).');
      return;
    }

    setLoading(true);
    setInput('');

    try {
      if (!isMockMode && supabase) {
        // Insert into Supabase (RLS policy will check auth.uid() === user_id)
        const { error: insErr } = await supabase
          .from('shoutbox_messages')
          .insert({
            user_id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
            message: msgText,
            role: user.role || 'user'
          });

        if (insErr) throw insErr;
      } else {
        // LocalStorage insert in Mock Mode
        const newMsg = {
          id: `m_user_${Date.now()}`,
          username: user.username,
          avatar_url: user.avatar_url,
          message: msgText,
          role: user.role || 'user',
          created_at: new Date().toISOString()
        };

        const mockChat = JSON.parse(localStorage.getItem('rc_shoutbox') || '[]');
        const updated = [...mockChat, newMsg].slice(-30);
        localStorage.setItem('rc_shoutbox', JSON.stringify(updated));
        setMessages(updated);
      }
    } catch (err) {
      setError(err.message || 'Failed to send message.');
      setInput(msgText); // Restore input on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full rounded-2xl glass-card border border-dark-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-border bg-zinc-950/40 p-4 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4.5 w-4.5 text-primary" />
          <h3 className="text-sm font-bold text-white tracking-wide">Live Shoutbox</h3>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 text-[10px] font-bold text-primary uppercase">
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          {isMockMode ? 'Sandbox Live' : 'Realtime Chat'}
        </span>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-zinc-950/20">
        {messages.map((msg, index) => {
          const isAdmin = msg.role === 'admin';
          return (
            <div key={msg.id || index} className="flex items-start gap-2.5 max-w-[90%] text-xs">
              <img 
                src={msg.avatar_url || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`}
                alt={msg.username}
                className="h-6 w-6 rounded-full border border-dark-border mt-0.5 shrink-0"
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`font-bold ${isAdmin ? 'text-red-400' : 'text-zinc-350'}`}>
                    {msg.username}
                  </span>
                  {isAdmin && (
                    <span className="flex items-center gap-0.5 rounded bg-red-950/40 border border-red-900/50 px-1 py-0.2 text-[8px] font-black uppercase text-red-400">
                      <Shield className="h-2 w-2" /> Admin
                    </span>
                  )}
                  <span className="text-[9px] text-zinc-600">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-1 text-zinc-300 bg-zinc-900/30 border border-dark-border/10 rounded-xl px-3 py-1.5 break-words leading-relaxed select-text">
                  {msg.message}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-dark-border bg-zinc-950/40 shrink-0">
        {error && (
          <div className="mb-2 flex items-center gap-1.5 text-[11px] text-red-400 bg-red-950/10 border border-red-950/40 p-2 rounded-lg">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {user ? (
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              required
              maxLength={250}
              placeholder="Write a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl bg-zinc-950 border border-dark-border px-3 py-2.5 text-xs text-white placeholder-zinc-650 focus:border-primary focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl bg-primary hover:opacity-90 active:scale-[0.95] p-2.5 text-black disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center shrink-0"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4 fill-black text-black" />
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-2 text-xs text-zinc-500 font-semibold uppercase tracking-wider">
            Please sign in to join the chat
          </div>
        )}
      </div>
    </div>
  );
}
