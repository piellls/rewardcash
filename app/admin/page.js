'use client';

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { ShieldAlert, Lock, Check, X, Coins, Users, Wallet, Loader2, AlertCircle, CheckCircle2, MessageSquare, ArrowLeft, Send } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();

  const isUserOnline = (usr) => {
    if (!usr.last_seen_at) return false;
    const lastSeen = new Date(usr.last_seen_at).getTime();
    const now = Date.now();
    return now - lastSeen < 90000;
  };

  const getLastSeenText = (usr) => {
    if (!usr.last_seen_at) return 'Never';
    const lastSeen = new Date(usr.last_seen_at).getTime();
    const diff = Date.now() - lastSeen;
    if (diff < 90000) return 'Online';
    
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };
  
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

  // User Audit Inspection States
  const [inspectingUser, setInspectingUser] = useState(null);
  const [userCompletions, setUserCompletions] = useState([]);
  const [userClicks, setUserClicks] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState('');
  const [banning, setBanning] = useState(false);

  const handleInspectUser = async (usr) => {
    setInspectingUser(usr);
    setAdjustmentAmount('');
    setAdjustError('');
    setAdjustSuccess('');
    setLoadingDetails(true);
    try {
      const completionsData = await db.getCompletedOffers(usr.id);
      const clicksData = await db.adminGetOfferClicks(usr.id);
      setUserCompletions(completionsData || []);
      setUserClicks(clicksData || []);
    } catch (e) {
      console.error('Failed to load user details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!inspectingUser || !adjustmentAmount) return;
    
    const amountVal = parseInt(adjustmentAmount);
    if (isNaN(amountVal) || amountVal === 0) {
      setAdjustError('Please enter a valid non-zero integer.');
      return;
    }

    setAdjusting(true);
    setAdjustError('');
    setAdjustSuccess('');

    try {
      await db.adminAdjustBalance(inspectingUser.id, amountVal);
      setAdjustSuccess(`Successfully adjusted balance by ${amountVal > 0 ? '+' : ''}${amountVal} coins!`);
      setAdjustmentAmount('');
      
      // Update inspectingUser local details
      setInspectingUser(prev => {
        if (!prev) return null;
        const nextBalance = Math.max(0, (prev.balance_coins || 0) + amountVal);
        const nextTotal = (prev.total_earned_coins || 0) + (amountVal > 0 ? amountVal : 0);
        return {
          ...prev,
          balance_coins: nextBalance,
          total_earned_coins: nextTotal
        };
      });
      
      await loadData();
    } catch (err) {
      console.error(err);
      setAdjustError(err.message || 'Failed to adjust balance.');
    } finally {
      setAdjusting(false);
    }
  };

  const handleToggleBan = async () => {
    if (!inspectingUser) return;
    const isCurrentlyBanned = !!inspectingUser.is_banned;
    
    setBanning(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await db.adminToggleBan(inspectingUser.id, !isCurrentlyBanned);
      setSuccessMsg(`User successfully ${!isCurrentlyBanned ? 'banned' : 'unbanned'}!`);
      
      // Update inspectingUser state in modal
      setInspectingUser(prev => prev ? { ...prev, is_banned: !isCurrentlyBanned } : null);
      
      await loadData();
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 5000);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to toggle ban status.');
    } finally {
      setBanning(false);
    }
  };

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

  // If auth is loading, show blank/spinner to prevent flash 404
  if (authLoading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20 text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // If not admin, return 404
  if (!user || user.role !== 'admin') {
    notFound();
    return null;
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
                <span className="text-base font-black text-white">
                  {usersList.filter(u => u.role !== 'admin').length} Accounts 
                  <span className="text-[10px] text-emerald-500 font-extrabold ml-1.5 animate-pulse">
                    ({usersList.filter(u => u.role !== 'admin' && isUserOnline(u)).length} online)
                  </span>
                </span>
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
              className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 active:scale-95 transition-all ${
                activeTab === 'withdrawals' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-350'
              }`}
            >
              Withdrawal Queue ({withdrawals.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 active:scale-95 transition-all ${
                activeTab === 'users' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-350'
              }`}
            >
              User Directory ({usersList.length})
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`pb-2 text-xs font-bold uppercase tracking-wider border-b-2 active:scale-95 transition-all ${
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
                        <tr key={w.id} className="group hover:bg-zinc-50/10 transition-colors">
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
                      <th className="pb-3 px-4">Country</th>
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
                        <tr 
                          key={usr.id} 
                          onClick={() => handleInspectUser(usr)}
                          className="group hover:bg-zinc-50/10 active:bg-zinc-50/20 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 pr-4">
                            <div className="flex items-center gap-2.5">
                              <div className="relative shrink-0">
                                <img 
                                  src={usr.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                                  alt={usr.username}
                                  className="h-7 w-7 rounded-full border border-dark-border object-cover"
                                />
                                <span className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-dark-card ${
                                  isUserOnline(usr) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-zinc-500'
                                }`} />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-white truncate">{usr.username}</span>
                                  {usr.is_banned && (
                                    <span className="rounded bg-red-950/60 border border-red-900/60 px-1.5 py-0.5 text-[8px] font-black text-red-500 uppercase tracking-widest leading-none shrink-0">
                                      Banned
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] font-semibold mt-0.5 shrink-0">
                                  {isUserOnline(usr) ? (
                                    <span className="text-emerald-500 font-extrabold animate-pulse">Active Now</span>
                                  ) : (
                                    <span className="text-zinc-550">Last seen: {getLastSeenText(usr)}</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400 font-mono">{usr.email}</td>
                          <td className="py-3.5 px-4 text-base select-none">
                            {usr.country || '🌍'}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-500">{new Date(usr.created_at).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4 text-left">
                            {referrer ? (
                              <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary inline-flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Referred by <span className="underline font-extrabold">{referrer.username}</span>
                              </span>
                            ) : (
                              <span className="rounded bg-zinc-100 border border-dark-border px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
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
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-all py-1.5 px-3 rounded-xl bg-zinc-100 border border-dark-border active:scale-95"
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
                    className={`rounded-xl px-4 py-1.5 text-xs font-extrabold active:scale-95 transition-all border ${
                      selectedTicket.status === 'resolved'
                        ? 'bg-amber-950/25 hover:bg-amber-900/40 text-yellow-500 border-yellow-500/25'
                        : 'bg-emerald-950/25 hover:bg-emerald-900/40 text-emerald-400 border-emerald-500/25'
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
                    <div className="bg-zinc-100 border border-dark-border/60 rounded-2xl rounded-tl-none px-4 py-3 text-zinc-300 leading-relaxed shadow-sm">
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
                          ? 'bg-zinc-100 border-dark-border/60 rounded-tl-none text-zinc-300' 
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
                  className="flex-1 rounded-xl bg-zinc-100 border border-dark-border px-3.5 py-2.5 text-xs text-white placeholder-zinc-550 focus:border-primary focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyMessage.trim()}
                  className="btn-gaming rounded-xl px-4 text-black disabled:opacity-50 disabled:scale-100 flex items-center justify-center shrink-0"
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
                        <tr key={t.id} className="group hover:bg-zinc-50/10 transition-colors">
                          <td className="py-3.5 pr-4 font-bold text-white">{t.username}</td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-zinc-500">{t.email}</td>
                          <td className="py-3.5 px-4 text-zinc-800 font-semibold">{t.subject}</td>
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
                                className="rounded-lg bg-zinc-100 border border-dark-border hover:bg-zinc-50 p-1.5 text-zinc-400 hover:text-primary transition-all active:scale-90"
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

      {/* User Audit Inspection Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => setInspectingUser(null)} />
          <div className="relative w-full max-w-4xl rounded-2xl border border-dark-border bg-dark-card p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-primary to-blue-500" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-dark-border/40 pb-4 mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img 
                    src={inspectingUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt={inspectingUser.username}
                    className="h-10 w-10 rounded-full border border-dark-border object-cover"
                  />
                  <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-dark-card ${
                    isUserOnline(inspectingUser) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-zinc-500'
                  }`} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>{inspectingUser.username}'s Audit Log</span>
                    <span className="text-xs">{inspectingUser.country || '🌍'}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider shrink-0 ${
                      isUserOnline(inspectingUser) ? 'bg-emerald-950/60 border border-emerald-900/40 text-emerald-500 animate-pulse' : 'bg-zinc-900 border border-dark-border text-zinc-400'
                    }`}>
                      {isUserOnline(inspectingUser) ? 'Active' : getLastSeenText(inspectingUser)}
                    </span>
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-semibold truncate max-w-sm sm:max-w-md">{inspectingUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleBan}
                  disabled={banning}
                  className={`rounded-xl border px-3 py-1.5 text-[10px] font-extrabold uppercase transition-all active:scale-95 flex items-center gap-1.5 ${
                    inspectingUser.is_banned 
                      ? 'border-emerald-850 bg-emerald-950/20 text-emerald-500 hover:bg-emerald-900/30' 
                      : 'border-red-900 bg-red-950/20 text-red-500 hover:bg-red-900/30'
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {banning ? 'Updating...' : inspectingUser.is_banned ? 'Unban Account' : 'Ban Account'}
                </button>

                <button 
                  onClick={() => setInspectingUser(null)}
                  className="rounded-xl border border-dark-border/60 bg-dark-bg/60 p-2 text-zinc-400 hover:text-white hover:bg-dark-bg transition-all active:scale-95"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loadingDetails ? (
              <div className="flex-1 flex justify-center items-center py-20 text-zinc-500">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span className="text-xs font-bold">Loading audit details...</span>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                
                {/* Stats cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-dark-border bg-dark-bg/40 p-4">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Available Balance</p>
                    <p className="text-sm font-black text-primary flex items-center gap-1">
                      <Coins className="h-4 w-4" />
                      {inspectingUser.balance_coins?.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-dark-border bg-dark-bg/40 p-4">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Earned</p>
                    <p className="text-sm font-black text-white flex items-center gap-1">
                      <Coins className="h-4 w-4 text-primary" />
                      {inspectingUser.total_earned_coins?.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-dark-border bg-dark-bg/40 p-4">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Completed Offers</p>
                    <p className="text-sm font-black text-emerald-500">{userCompletions.length}</p>
                  </div>
                  <div className="rounded-xl border border-dark-border bg-dark-bg/40 p-4">
                    <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Total Clicks</p>
                    <p className="text-sm font-black text-amber-500">{userClicks.length}</p>
                  </div>
                </div>

                {/* Balance adjustment modifier panel */}
                <div className="rounded-xl border border-dark-border bg-dark-bg/20 p-5">
                  <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Adjust User Balance</h4>
                  <form onSubmit={handleAdjustBalance} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        placeholder="e.g. +500 or -200"
                        value={adjustmentAmount}
                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                        className="w-full rounded-xl border border-dark-border bg-dark-bg/60 px-4 py-2.5 text-xs text-white placeholder-zinc-550 focus:border-primary focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={adjusting || !adjustmentAmount}
                      className="rounded-xl bg-primary px-5 py-2.5 text-xs font-extrabold text-white transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {adjusting ? 'Updating...' : 'Adjust Credits'}
                    </button>
                  </form>
                  {adjustError && (
                    <p className="text-[10px] text-red-500 font-bold mt-2">{adjustError}</p>
                  )}
                  {adjustSuccess && (
                    <p className="text-[10px] text-emerald-500 font-bold mt-2">{adjustSuccess}</p>
                  )}
                </div>

                {/* Grid for Clicks w Completions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Column 1: Completions */}
                  <div className="rounded-xl border border-dark-border bg-dark-bg/25 p-4 flex flex-col max-h-[350px]">
                    <h4 className="text-xs font-black text-white mb-3 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Completed Leads ({userCompletions.length})
                    </h4>
                    
                    {userCompletions.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-zinc-500 py-10">
                        No completed offers logged yet.
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar text-[11px] pr-1">
                        {userCompletions.map((comp) => (
                          <div key={comp.id} className="rounded-lg border border-dark-border/40 bg-dark-card/55 p-3 flex justify-between items-center gap-2">
                            <div>
                              <p className="font-bold text-white leading-none mb-1">{comp.offer_id}</p>
                              <p className="text-[9px] text-zinc-500 font-semibold">
                                Provider: <span className="text-zinc-400 uppercase">{comp.provider}</span> • {new Date(comp.completed_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-emerald-500 font-extrabold flex items-center justify-end gap-0.5 leading-none mb-1">
                                +{comp.coins_earned} Coins
                              </span>
                              <span className="text-[9px] text-zinc-500 font-bold">${parseFloat(comp.payout_usd || 0).toFixed(2)} USD</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Column 2: Clicks */}
                  <div className="rounded-xl border border-dark-border bg-dark-bg/25 p-4 flex flex-col max-h-[350px]">
                    <h4 className="text-xs font-black text-white mb-3 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Clicked Offers Log ({userClicks.length})
                    </h4>
                    
                    {userClicks.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-[10px] font-bold text-zinc-500 py-10">
                        No clicked offers logged f database.
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar text-[11px] pr-1">
                        {userClicks.map((clk) => (
                          <div key={clk.id} className="rounded-lg border border-dark-border/40 bg-dark-card/55 p-3 flex justify-between items-center gap-2">
                            <div>
                              <p className="font-bold text-white leading-none mb-1">{clk.offer_title}</p>
                              <p className="text-[9px] text-zinc-500 font-semibold">
                                ID: <span className="text-zinc-400">{clk.offer_id}</span> • {new Date(clk.clicked_at).toLocaleString()}
                              </p>
                            </div>
                            <span className="text-[10px] font-extrabold text-amber-500 shrink-0 bg-amber-955/15 border border-amber-900/20 px-2 py-0.5 rounded-md uppercase">
                              {clk.provider}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
            
            {/* Footer */}
            <div className="border-t border-dark-border/40 pt-4 mt-4 text-right shrink-0">
              <button 
                onClick={() => setInspectingUser(null)}
                className="btn-gaming-secondary rounded-xl px-5 py-2.5 text-xs font-extrabold"
              >
                Close Audit Log
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
