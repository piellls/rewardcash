'use client';

import { useState, useEffect, useRef } from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => {
          if (!loading && !sendingMsg) {
            setSelectedTicket(null);
            onClose();
          }
        }}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl glass-card border border-dark-border p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button 
          onClick={() => {
            setSelectedTicket(null);
            onClose();
          }}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white active:scale-90 transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Back Button for Chat details */}
        {selectedTicket && (
          <button
            onClick={() => {
              setSelectedTicket(null);
              loadTickets();
            }}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-4 active:scale-95 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to History
          </button>
        )}

        {/* Header */}
        {!selectedTicket && (
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 rounded-full bg-primary/10 border border-primary/20 w-12 h-12 flex items-center justify-center text-primary">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Support Desk</h2>
            <p className="mt-1 text-xs text-zinc-400">
              Submit support tickets and view active or resolved conversations.
            </p>
          </div>
        )}

        {/* Navigation Tabs (Only visible when not inside a chat thread) */}
        {!selectedTicket && user && (
          <div className="flex gap-6 border-b border-dark-border mb-5 pb-2 text-xs">
            <button
              onClick={() => setActiveTab('submit')}
              className={`pb-2 font-bold uppercase tracking-wider active:scale-95 transition-all border-b-2 ${
                activeTab === 'submit' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Open Ticket
            </button>
            <button
              onClick={() => {
                setActiveTab('list');
                loadTickets();
              }}
              className={`pb-2 font-bold uppercase tracking-wider active:scale-95 transition-all border-b-2 ${
                activeTab === 'list' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              My Tickets
            </button>
          </div>
        )}

        {/* ERROR Banner */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-900/50 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab 1: Submit Ticket Form */}
        {!selectedTicket && activeTab === 'submit' && (
          success ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto rounded-full bg-emerald-950/30 border border-emerald-900/50 w-12 h-12 flex items-center justify-center text-primary animate-bounce">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-150">Ticket Submitted Successfully!</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                  Your ticket has been sent. Redirecting to your tickets list...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!user ? (
                <div className="text-center py-6 text-sm text-zinc-400 border border-dashed border-dark-border rounded-xl">
                  Please log in to submit a support request.
                </div>
              ) : (
                <>
                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Subject / Topic
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Coins missing for Level 11 offer"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-lg bg-zinc-950 border border-dark-border py-2.5 px-4 text-xs text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                      Explain Your Issue
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Please mention the offer details, provider name, date completed, and any issue..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-lg bg-zinc-950 border border-dark-border py-2.5 px-4 text-xs text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Action button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gaming w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                    ) : (
                      'Submit Ticket'
                    )}
                  </button>
                </>
              )}
            </form>
          )
        )}

        {/* Tab 2: My Tickets List */}
        {!selectedTicket && activeTab === 'list' && (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {loadingList ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs border border-dashed border-dark-border rounded-xl">
                You haven't opened any support tickets yet.
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="group relative flex items-center justify-between rounded-xl bg-zinc-950/40 border border-dark-border/60 p-4 cursor-pointer hover:bg-zinc-900/60 hover:border-zinc-800 transition-all active:scale-[0.99]"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-white group-hover:text-primary transition-colors">
                        {t.subject}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-medium">
                        {new Date(t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {t.message}
                    </p>
                  </div>

                  <div className="shrink-0">
                    {t.status === 'resolved' ? (
                      <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/50">
                        Resolved
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-wider text-yellow-500 bg-amber-950/20 px-2.5 py-1 rounded border border-amber-900/50 animate-pulse-slow">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Selected Ticket: Two-Way Chat View */}
        {selectedTicket && (
          <div className="flex flex-col h-[400px]">
            {/* Thread Details Header */}
            <div className="border-b border-dark-border/40 pb-3 mb-3 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Ticket Subject</span>
                <h3 className="text-sm font-bold text-white leading-snug truncate max-w-[280px]">{selectedTicket.subject}</h3>
              </div>
              <div>
                {selectedTicket.status === 'resolved' ? (
                  <span className="text-[10px] font-bold text-primary bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/50">
                    Resolved
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-yellow-500 bg-amber-950/20 px-2.5 py-1 rounded border border-amber-900/50">
                    Pending
                  </span>
                )}
              </div>
            </div>

            {/* Chat Thread Messages Box */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 pb-2 text-xs">
              {/* Initial message details */}
              <div className="flex items-start gap-2.5 max-w-[85%]">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-zinc-300">{selectedTicket.username}</span>
                    <span className="text-[9px] text-zinc-500">
                      {new Date(selectedTicket.created_at).toLocaleDateString()} at {new Date(selectedTicket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="bg-zinc-900/40 border border-dark-border/20 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-zinc-300 leading-relaxed select-text">
                    {selectedTicket.message}
                  </p>
                </div>
              </div>

              {/* Replied messages thread */}
              {!loadingChat && chatMessages.map((msg) => {
                const isUserMsg = !msg.is_admin;
                return (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[85%] ${isUserMsg ? 'items-start' : 'items-end ml-auto'}`}
                  >
                    <div className={`flex items-center gap-2 mb-1 flex-wrap ${!isUserMsg && 'justify-end'}`}>
                      <span className={`font-bold ${isUserMsg ? 'text-zinc-300' : 'text-primary'}`}>
                        {isUserMsg ? msg.sender_username : 'Admin Support'}
                      </span>
                      <span className="text-[9px] text-zinc-500">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`px-3.5 py-2.5 rounded-2xl leading-relaxed select-text border ${
                      isUserMsg 
                        ? 'bg-zinc-900/40 border-dark-border/20 rounded-tl-none text-zinc-300' 
                        : 'bg-primary/5 border-primary/10 rounded-tr-none text-white'
                    }`}>
                      {msg.message}
                    </p>
                  </div>
                );
              })}
              
              {loadingChat && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Chat Send Form */}
            <form onSubmit={handleSendReply} className="mt-3 flex gap-2 border-t border-dark-border/40 pt-3 shrink-0">
              <input
                type="text"
                required
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedTicket.status === 'resolved' ? "Type to reopen and reply..." : "Send a follow-up reply..."}
                className="flex-1 rounded-xl bg-zinc-950 border border-dark-border px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-primary focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="btn-gaming rounded-xl px-4 text-black disabled:opacity-50 disabled:scale-100 flex items-center justify-center shrink-0"
              >
                {sendingMsg ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 fill-black text-black" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
