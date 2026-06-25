'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { ShieldAlert, Lock, Check, X, Coins, Users, Wallet, Loader2, AlertCircle, CheckCircle2, MessageSquare, ArrowLeft, Send } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('withdrawals'); // 'withdrawals', 'users', or 'tickets'
  const [withdrawals, setWithdrawals] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Support Chat States
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Action loading states
  const [processingId, setProcessingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (user && user.role === 'admin') {
      setLoading(true);
      try {
        const w = await db.adminGetWithdrawals();
        const u = await db.adminGetUsers();
        const t = await db.adminGetSupportTickets();
        setWithdrawals(w);
        setUsersList(u);
        setTickets(t || []);
      } catch (err) {
        console.error('Error loading admin data:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    setSelectedTicket(null);
  }, [activeTab]);

  const handleUpdateStatus = async (id, status) => {
    setErrorMsg('');
    setSuccessMsg('');
    setProcessingId(id);

    try {
      await db.adminUpdateWithdrawal(id, status);
      setSuccessMsg(`Withdrawal successfully marked as ${status}!`);
      await loadData();
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update withdrawal status.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolveTicket = async (id) => {
    setErrorMsg('');
    setSuccessMsg('');
    setProcessingId(id);

    try {
      await db.adminResolveSupportTicket(id);
      setSuccessMsg('Support ticket resolved successfully!');
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(prev => prev ? { ...prev, status: 'resolved' } : null);
      }
      await loadData();
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resolve support ticket.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleTicketStatus = async (ticketId, currentStatus) => {
    const nextStatus = currentStatus === 'resolved' ? 'pending' : 'resolved';
    setErrorMsg('');
    setSuccessMsg('');
    setProcessingId(ticketId);
    try {
      await db.adminUpdateTicketStatus(ticketId, nextStatus);
      setSuccessMsg(`Ticket status successfully updated to ${nextStatus}!`);
      
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket(prev => prev ? { ...prev, status: nextStatus } : null);
      }
      
      await loadData();
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update ticket status.');
    } finally {
      setProcessingId(null);
    }
  };

  const loadChatMessages = async (ticketId) => {
    setLoadingChat(true);
    try {
      const data = await db.getSupportTicketMessages(ticketId);
      setChatMessages(data || []);
    } catch (err) {
      console.error('Error loading chat:', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket || !user) return;
    
    setErrorMsg('');
    setSendingReply(true);
    try {
      await db.sendSupportTicketMessage(
        selectedTicket.id, 
        user.id, 
        user.username, 
        replyMessage.trim(), 
        true // is_admin
      );
      setReplyMessage('');
      
      await loadChatMessages(selectedTicket.id);
      await loadData();
    } catch (err) {
      console.error('Error sending reply:', err);
      setErrorMsg('Failed to send message.');
    } finally {
      setSendingReply(false);
    }
  };

  // If not admin, show access denied
  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 flex-1 flex flex-col justify-center items-center text-center">
        <div className="rounded-full bg-red-950/20 border border-red-900/50 p-4 text-red-500 mb-6">
          <Lock className="h-8 w-8 text-red-500 animate-pulse" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Access Denied</h1>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          You must be logged in as an Administrator to view this control panel.
        </p>
        
        <div className="rounded-xl border border-dark-border bg-dark-card p-5 text-xs text-zinc-450 w-full space-y-2.5 text-zinc-400">
          <p className="font-bold text-white border-b border-dark-border/40 pb-2">Demo Administrator Account:</p>
          <div className="flex justify-between text-left">
            <span className="text-zinc-500 font-semibold">Email:</span>
            <span className="font-mono text-primary font-bold">admin@rewardcash.co</span>
          </div>
          <div className="flex justify-between text-left">
            <span className="text-zinc-500 font-semibold">Password:</span>
            <span className="font-mono text-secondary font-bold">admin123</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const pendingTickets = tickets.filter(t => t.status === 'pending');
  const totalVolumeUSD = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + parseFloat(w.amount_usd), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-7 w-7 text-red-500 animate-pulse" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Audit withdrawals, check support logs, and manage player accounts.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-4 text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-950/40 border border-red-900/60 p-4 text-red-400 animate-pulse">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
            Loading Admin Panel...
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-dark-border bg-dark-card p-5 flex items-center gap-4 hover:border-primary/10 transition-all">
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-2.5 text-yellow-500">
                <Wallet className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Pending Cashouts</span>
                <span className="text-base font-black text-white">{pendingWithdrawals.length} Requests</span>
              </div>
            </div>

            <div className="rounded-xl border border-dark-border bg-dark-card p-5 flex items-center gap-4 hover:border-primary/10 transition-all">
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5 text-primary">
                <Users className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider">User Base</span>
                <span className="text-base font-black text-white">{usersList.length} Accounts</span>
              </div>
            </div>

            <div className="rounded-xl border border-dark-border bg-dark-card p-5 flex items-center gap-4 hover:border-primary/10 transition-all">
              <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-2.5 text-purple-400">
                <MessageSquare className="h-5.5 w-5.5" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Pending Support</span>
                <span className="text-base font-black text-white">{pendingTickets.length} Tickets</span>
              </div>
            </div>

            <div className="rounded-xl border border-dark-border bg-dark-card p-5 flex items-center gap-4 hover:border-primary/10 transition-all">
              <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-2.5 text-secondary">
                <Coins className="h-5.5 w-5.5 animate-pulse" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Paid Payouts</span>
                <span className="text-base font-black text-white">${totalVolumeUSD.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Admin Tabs Navigation */}
          <div className="flex gap-4 border-b border-dark-border pb-2.5">
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'withdrawals' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-350'
              }`}
            >
              Withdrawal Queue ({withdrawals.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'users' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-350'
              }`}
            >
              User Directory ({usersList.length})
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'tickets' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-350'
              }`}
            >
              Support Inbox ({tickets.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'withdrawals' ? (
            <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
              {withdrawals.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-550 font-bold uppercase tracking-wide">
                  No payout requests currently queued.
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-3">
                        <th className="pb-3 pr-4">User</th>
                        <th className="pb-3 px-4">Method</th>
                        <th className="pb-3 px-4">USD Value</th>
                        <th className="pb-3 px-4">Coins Required</th>
                        <th className="pb-3 px-4">Payout Account Address</th>
                        <th className="pb-3 px-4">Request Date</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30 text-zinc-300">
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="group hover:bg-zinc-900/10 transition-colors">
                          <td className="py-3 pr-4 font-bold text-white">{w.username}</td>
                          <td className="py-3 px-4 font-semibold text-zinc-450 uppercase">{w.payment_method}</td>
                          <td className="py-3 px-4 text-primary font-extrabold">${parseFloat(w.amount_usd).toFixed(2)}</td>
                          <td className="py-3 px-4 text-zinc-400 font-medium">{w.coins_spent?.toLocaleString()}</td>
                          <td className="py-3 px-4 font-mono text-[10px] text-zinc-500 max-w-[150px] truncate" title={w.payment_address}>{w.payment_address}</td>
                          <td className="py-3 px-4 text-zinc-500">{new Date(w.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            {w.status === 'approved' && <span className="rounded bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">Approved</span>}
                            {w.status === 'rejected' && <span className="rounded bg-red-950/40 border border-red-900/60 px-2 py-0.5 text-[9px] font-bold text-red-400 uppercase">Rejected</span>}
                            {w.status === 'pending' && <span className="rounded bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 text-[9px] font-bold text-yellow-500 uppercase animate-pulse">Pending</span>}
                          </td>
                          <td className="py-3 pl-4 text-right">
                            {w.status === 'pending' && (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleUpdateStatus(w.id, 'approved')}
                                  disabled={processingId !== null}
                                  className="rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 p-1 text-primary disabled:opacity-50 transition-all active:scale-90"
                                  title="Approve & Clear Payout"
                                >
                                  {processingId === w.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(w.id, 'rejected')}
                                  disabled={processingId !== null}
                                  className="rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800 p-1 text-red-400 disabled:opacity-50 transition-all active:scale-90"
                                  title="Reject & Refund Coins"
                                >
                                  {processingId === w.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <X className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : activeTab === 'users' ? (
            <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-550 uppercase tracking-widest pb-3">
                      <th className="pb-3 pr-4">User account</th>
                      <th className="pb-3 px-4">Email</th>
                      <th className="pb-3 px-4">Register Date</th>
                      <th className="pb-3 px-4">Signup Source</th>
                      <th className="pb-3 px-4 text-right">Available Balance</th>
                      <th className="pb-3 pl-4 text-right">Total Earnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/30 text-zinc-300">
                    {usersList.filter(usr => usr.role !== 'admin').map((usr) => {
                      const referrer = usr.referred_by ? usersList.find(u => u.id === usr.referred_by) : null;
                      return (
                        <tr key={usr.id} className="group hover:bg-zinc-900/10 transition-colors">
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={usr.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                                alt={usr.username}
                                className="h-7 w-7 rounded-full border border-dark-border object-cover"
                              />
                              <span className="font-bold text-white">{usr.username}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 font-mono">{usr.email}</td>
                          <td className="py-3.5 px-4 text-zinc-500">{new Date(usr.created_at).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 text-left">
                            {referrer ? (
                              <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary inline-flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Referred by <span className="underline font-extrabold">{referrer.username}</span>
                              </span>
                            ) : (
                              <span className="rounded bg-zinc-950 border border-dark-border px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                                Direct Signup
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-primary">
                            <div className="flex items-center justify-end gap-1">
                              <Coins className="h-3.5 w-3.5 text-primary" />
                              {usr.balance_coins?.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3.5 pl-4 text-right font-extrabold text-white">
                            <div className="flex items-center justify-end gap-1">
                              <Coins className="h-3.5 w-3.5 text-primary" />
                              {usr.total_earned_coins?.toLocaleString()}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : selectedTicket ? (
            <div className="rounded-2xl border border-dark-border bg-dark-card p-6 flex flex-col h-[500px] relative overflow-hidden shadow-xl">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-dark-border/40 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-all py-1.5 px-3 rounded-xl bg-zinc-950 border border-dark-border active:scale-95"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-none">
                      Support conversation with {selectedTicket.username}
                    </h3>
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Account: <span className="font-mono text-zinc-400">{selectedTicket.email}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  {selectedTicket.status === 'resolved' ? (
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-900/50">
                      Resolved
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-wider text-yellow-500 bg-amber-950/20 px-2.5 py-1 rounded border border-amber-900/50 animate-pulse">
                      Pending
                    </span>
                  )}

                  {/* Resolve / Reopen toggle */}
                  <button
                    onClick={() => handleToggleTicketStatus(selectedTicket.id, selectedTicket.status)}
                    disabled={processingId !== null}
                    className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all border active:scale-95 ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-amber-950/20 hover:bg-amber-900/40 text-yellow-500 border-amber-900/50'
                        : 'bg-emerald-950/20 hover:bg-emerald-900/40 text-primary border-emerald-900/50'
                    }`}
                  >
                    {processingId === selectedTicket.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : selectedTicket.status === 'resolved' ? (
                      'Reopen Ticket'
                    ) : (
                      'Resolve Ticket'
                    )}
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages Box */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 pb-2 text-xs">
                {/* Initial message details */}
                <div className="flex items-start gap-2.5 max-w-[85%]">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-zinc-400">{selectedTicket.username}</span>
                      <span className="text-[9px] text-zinc-550">
                        {new Date(selectedTicket.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="bg-zinc-950 border border-dark-border/60 rounded-2xl rounded-tl-none px-4 py-3 text-zinc-300 leading-relaxed shadow-sm">
                      <div className="font-bold text-white mb-1.5 border-b border-dark-border/40 pb-1 flex justify-between gap-4">
                        <span>Subject: {selectedTicket.subject}</span>
                      </div>
                      {selectedTicket.message}
                    </div>
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
                        <span className={`font-bold ${isUserMsg ? 'text-zinc-400' : 'text-primary'}`}>
                          {isUserMsg ? msg.sender_username : 'Admin Support'}
                        </span>
                        <span className="text-[9px] text-zinc-550">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={`px-4 py-2.5 rounded-2xl leading-relaxed border ${
                        isUserMsg 
                          ? 'bg-zinc-950 border-dark-border/60 rounded-tl-none text-zinc-300' 
                          : 'bg-primary/5 border-primary/20 rounded-tr-none text-white'
                      }`}>
                        {msg.message}
                      </p>
                    </div>
                  );
                })}
                
                {loadingChat && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendAdminReply} className="mt-3 flex gap-2 border-t border-dark-border/40 pt-3 shrink-0">
                <input
                  type="text"
                  required
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder={selectedTicket.status === 'resolved' ? "Reopen ticket or type reply..." : "Type reply to user..."}
                  className="flex-1 rounded-xl bg-zinc-950 border border-dark-border px-3.5 py-2.5 text-xs text-white placeholder-zinc-550 focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyMessage.trim()}
                  className="rounded-xl bg-primary hover:opacity-90 active:scale-[0.95] px-4 text-black disabled:opacity-50 disabled:scale-100 transition-all flex items-center justify-center shrink-0"
                >
                  {sendingReply ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 text-black fill-black" />
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-dark-border bg-dark-card p-6">
              {tickets.length === 0 ? (
                <div className="text-center py-10 text-xs text-zinc-550 font-bold uppercase tracking-wide">
                  No support tickets present.
                </div>
              ) : (
                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-dark-border/40 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pb-3">
                        <th className="pb-3 pr-4">User</th>
                        <th className="pb-3 px-4">Email</th>
                        <th className="pb-3 px-4">Subject</th>
                        <th className="pb-3 px-4">Message Preview</th>
                        <th className="pb-3 px-4">Date</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/30 text-zinc-300">
                      {tickets.map((t) => (
                        <tr key={t.id} className="group hover:bg-zinc-900/10 transition-colors">
                          <td className="py-3.5 pr-4 font-bold text-white">{t.username}</td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-500">{t.email}</td>
                          <td className="py-3.5 px-4 text-zinc-200 font-semibold">{t.subject}</td>
                          <td className="py-3.5 px-4 text-zinc-400 max-w-[250px] truncate" title={t.message}>{t.message}</td>
                          <td className="py-3.5 px-4 text-zinc-500">{new Date(t.created_at).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4">
                            {t.status === 'resolved' ? (
                              <span className="rounded bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">Resolved</span>
                            ) : (
                              <span className="rounded bg-amber-950/40 border border-amber-900/60 px-2 py-0.5 text-[9px] font-bold text-yellow-500 uppercase animate-pulse">Pending</span>
                            )}
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedTicket(t);
                                  loadChatMessages(t.id);
                                }}
                                className="rounded-lg bg-zinc-950 border border-dark-border hover:bg-zinc-900 p-1.5 text-zinc-400 hover:text-primary transition-all active:scale-90"
                                title="Open Message Thread"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </button>
 
                              {t.status === 'pending' && (
                                <button
                                  onClick={() => handleResolveTicket(t.id)}
                                  disabled={processingId !== null}
                                  className="rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 p-1.5 text-primary disabled:opacity-50 transition-all active:scale-90"
                                  title="Mark as Resolved"
                                >
                                  {processingId === t.id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Check className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
