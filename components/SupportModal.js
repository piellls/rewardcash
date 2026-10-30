'use client';

import { useState, useEffect, useRef } from 'react';
import { sfx } from '@/lib/sfx';
import { useAuth } from '@/context/AuthContext';
import { isMockMode, supabase, db } from '@/lib/db';
import { X, MessageSquare, AlertCircle, Loader2, CheckCircle2, ArrowLeft, Send, History } from 'lucide-react';

export default function SupportModal({ isOpen, onClose }) {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'list'
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Submit Ticket Form States
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Tickets List & Chat States
  const [tickets, setTickets] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const messagesEndRef = useRef(null);

  const closeAll = () => {
    if (loading || sendingMsg) return;
    setSelectedTicket(null);
    onClose();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when chat messages load or update
  useEffect(() => {
    if (selectedTicket && chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages, selectedTicket]);

  // Load ticket messages when ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      loadChatMessages();
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    if (!user) return;
    setLoadingList(true);
    setError('');
    try {
      const data = await db.getUserSupportTickets(user.id);
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to load support tickets history.');
    } finally {
      setLoadingList(false);
    }
  };

  const loadChatMessages = async () => {
    if (!selectedTicket) return;
    setLoadingChat(true);
    try {
      const data = await db.getSupportTicketMessages(selectedTicket.id);
      setChatMessages(data || []);
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Failed to load chat conversation.');
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    if (isOpen) sfx.play('open');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeAll(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, loading, sendingMsg]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('You must be logged in to submit a support ticket.');
      setLoading(false);
      return;
    }

    if (!subject.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      if (!isMockMode && supabase) {
        const { error: insErr } = await supabase
          .from('support_tickets')
          .insert({
            user_id: user.id,
            username: user.username,
            email: user.email,
            subject: subject.trim(),
            message: message.trim(),
            status: 'pending'
          });

        if (insErr) throw insErr;
      } else {
        // Mock Mode: Save in LocalStorage
        const mockTickets = JSON.parse(localStorage.getItem('rc_support_tickets') || '[]');
        const newTicket = {
          id: `t_${Math.random().toString(36).substr(2, 9)}`,
          user_id: user.id,
          username: user.username,
          email: user.email,
          subject: subject.trim(),
          message: message.trim(),
          status: 'pending',
          created_at: new Date().toISOString()
        };
        mockTickets.unshift(newTicket);
        localStorage.setItem('rc_support_tickets', JSON.stringify(mockTickets));
      }

      setSuccess(true);
      sfx.play('success');
      setSubject('');
      setMessage('');
      
      // Auto switch to list after short delay so they see their ticket
      setTimeout(() => {
        setSuccess(false);
        setActiveTab('list');
        loadTickets();
      }, 2550);

    } catch (err) {
      setError(err.message || 'Failed to submit support ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedTicket || !user) return;
    
    setError('');
    setSendingMsg(true);

    try {
      // 1. If ticket is resolved, reopen it by changing status to pending
      if (selectedTicket.status === 'resolved') {
        await db.adminUpdateTicketStatus(selectedTicket.id, 'pending');
        setSelectedTicket(prev => prev ? { ...prev, status: 'pending' } : null);
      }

      // 2. Send message
      await db.sendSupportTicketMessage(
        selectedTicket.id, 
        user.id, 
        user.username, 
        newMessage.trim(), 
        false
      );

      setNewMessage('');
      
      // 3. Reload messages
      const msgs = await db.getSupportTicketMessages(selectedTicket.id);
      setChatMessages(msgs || []);

    } catch (err) {
      console.error('Failed to send reply:', err);
      setError('Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const input = 'w-full rounded-xl border border-[var(--bb-border)] bg-[var(--bb-bg)] px-4 py-3 text-base text-white placeholder:text-zinc-500 transition-colors focus:border-[#7854f7] focus:outline-none focus:ring-2 focus:ring-[#7854f7]/30';
  const tabBtn = (on) => `relative px-1 pb-2.5 text-xs font-extrabold uppercase tracking-wider transition-colors ${on ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`;
  const statusPill = (status) => (
    status === 'resolved' ? (
      <span className="rounded-full border border-[#42d8a0]/35 bg-[#42d8a0]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#42d8a0]">Resolved</span>
    ) : (
      <span className="rounded-full border border-[#f3c76b]/35 bg-[#f3c76b]/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#f3c76b]">Pending</span>
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Support">
      <div className="g-fade fixed inset-0 bg-[#05070d]/80 backdrop-blur-sm" onClick={closeAll} />

      <div className="g-modal g-neon relative z-10 flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-[var(--bb-surface)] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]">
        <button
          type="button"
          onClick={closeAll}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--bb-border)] bg-[var(--bb-bg)]/60 text-zinc-400 transition-[transform,color,background-color] duration-150 hover:bg-white/5 hover:text-white active:scale-95"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        {selectedTicket && (
          <button
            type="button"
            onClick={() => { setSelectedTicket(null); loadTickets(); }}
            className="mb-4 flex items-center gap-1.5 self-start text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to tickets
          </button>
        )}

        {!selectedTicket && (
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7854f7]/40 bg-[#7854f7]/15 text-[#c3b2ff]">
              <MessageSquare className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="g-title text-2xl text-white">Support</h2>
            <p className="mt-1.5 text-sm text-[var(--bb-muted)]">Open a ticket or follow up on an existing one.</p>
          </div>
        )}

        {!selectedTicket && user && (
          <div className="mb-5 flex gap-6 border-b border-[var(--bb-border)]" role="tablist">
            <button type="button" role="tab" aria-selected={activeTab === 'submit'} onClick={() => setActiveTab('submit')} className={tabBtn(activeTab === 'submit')}>
              Open ticket
              {activeTab === 'submit' && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#7854f7]" />}
            </button>
            <button type="button" role="tab" aria-selected={activeTab === 'list'} onClick={() => { setActiveTab('list'); loadTickets(); }} className={tabBtn(activeTab === 'list')}>
              My tickets
              {activeTab === 'list' && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#7854f7]" />}
            </button>
          </div>
        )}

        {error && (
          <div role="alert" className="g-fade mb-4 flex items-start gap-2 rounded-xl border border-[#f17685]/40 bg-[#f17685]/10 p-3 text-sm text-[#f9a4af]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#f17685]" aria-hidden="true" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* Open ticket */}
          {!selectedTicket && activeTab === 'submit' && (
            success ? (
              <div className="g-fade space-y-4 py-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#42d8a0]/40 bg-[#42d8a0]/10 text-[#42d8a0]">
                  <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="g-title text-lg text-white">Ticket sent</h3>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-[var(--bb-muted)]">We will reply here. Taking you to your tickets…</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!user ? (
                  <div className="rounded-xl border border-dashed border-[var(--bb-border)] py-6 text-center text-sm text-[var(--bb-muted)]">
                    Please sign in to contact support.
                  </div>
                ) : (
                  <>
                    <div>
                      <label htmlFor="sp-subject" className="mb-1.5 block text-xs font-bold text-[var(--bb-muted)]">Subject</label>
                      <input
                        id="sp-subject"
                        type="text"
                        required
                        maxLength={120}
                        placeholder="e.g. Coins missing for an offer I completed"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className={input}
                      />
                    </div>
                    <div>
                      <label htmlFor="sp-message" className="mb-1.5 block text-xs font-bold text-[var(--bb-muted)]">What happened?</label>
                      <textarea
                        id="sp-message"
                        required
                        rows={4}
                        maxLength={2000}
                        placeholder="Tell us the offer name, the date, and what went wrong."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`${input} resize-none`}
                      />
                    </div>
                    <button type="submit" disabled={loading} className="btn-gaming flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Send ticket'}
                    </button>
                  </>
                )}
              </form>
            )
          )}

          {/* Ticket list */}
          {!selectedTicket && activeTab === 'list' && (
            <div className="space-y-3 pr-1">
              {loadingList ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-[#7854f7]" aria-label="Loading" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--bb-border)] py-10 text-center text-sm text-[var(--bb-muted)]">
                  You have no tickets yet.
                </div>
              ) : (
                tickets.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[var(--bb-border)] bg-[var(--bb-bg)]/60 p-4 text-left transition-[transform,border-color,background-color] duration-200 hover:border-[#7854f7]/60 hover:bg-[var(--bb-surface-2)] active:scale-[0.99]"
                  >
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-white">{t.subject}</span>
                        <span className="shrink-0 text-[10px] font-medium text-zinc-500">{new Date(t.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className="block truncate text-xs text-[var(--bb-muted)]">{t.message}</span>
                    </span>
                    {statusPill(t.status)}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Chat */}
          {selectedTicket && (
            <div className="flex h-[min(26rem,60dvh)] flex-col">
              <div className="mb-3 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--bb-border)] pb-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Ticket</span>
                  <h3 className="truncate text-sm font-bold leading-snug text-white">{selectedTicket.subject}</h3>
                </div>
                {statusPill(selectedTicket.status)}
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pb-2 pr-1.5 text-xs">
                <div className="flex max-w-[88%] flex-col">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-bold text-zinc-200">{selectedTicket.username}</span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(selectedTicket.created_at).toLocaleDateString()} {new Date(selectedTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="select-text whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm border border-[var(--bb-border)] bg-[var(--bb-surface-2)] px-3.5 py-2.5 text-sm leading-relaxed text-zinc-200">
                    {selectedTicket.message}
                  </p>
                </div>

                {!loadingChat && chatMessages.map((msg) => {
                  const mine = !msg.is_admin;
                  return (
                    <div key={msg.id} className={`flex max-w-[88%] flex-col ${mine ? 'items-start' : 'ml-auto items-end'}`}>
                      <div className={`mb-1 flex flex-wrap items-center gap-2 ${mine ? '' : 'justify-end'}`}>
                        <span className={`font-bold ${mine ? 'text-zinc-200' : 'text-[#c3b2ff]'}`}>{mine ? msg.sender_username : 'BlueberryCash support'}</span>
                        <span className="text-[10px] text-zinc-500">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className={`select-text whitespace-pre-wrap break-words rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed ${
                        mine
                          ? 'rounded-tl-sm border-[var(--bb-border)] bg-[var(--bb-surface-2)] text-zinc-200'
                          : 'rounded-tr-sm border-[#7854f7]/40 bg-[#7854f7]/15 text-white'
                      }`}>
                        {msg.message}
                      </p>
                    </div>
                  );
                })}

                {loadingChat && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-[#7854f7]" aria-label="Loading" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendReply} className="mt-3 flex shrink-0 gap-2 border-t border-[var(--bb-border)] pt-3">
                <input
                  type="text"
                  required
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  aria-label="Reply"
                  placeholder={selectedTicket.status === 'resolved' ? 'Type to reopen and reply…' : 'Write a reply…'}
                  className={`${input} flex-1 py-2.5`}
                />
                <button
                  type="submit"
                  disabled={sendingMsg || !newMessage.trim()}
                  aria-label="Send reply"
                  className="btn-gaming flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl"
                >
                  {sendingMsg ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
