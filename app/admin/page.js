'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { ShieldAlert, Lock, Check, X, Coins, Users, Wallet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('withdrawals'); // 'withdrawals' or 'users'
  const [withdrawals, setWithdrawals] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setWithdrawals(w);
        setUsersList(u);
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

  // If not admin, show access denied
  if (!user || user.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 flex-1 flex flex-col justify-center items-center text-center">
        <div className="rounded-full bg-red-950/20 border border-red-900/50 p-4 text-red-500 mb-6">
          <Lock className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Access Denied</h1>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          You must be logged in as an Administrator to view this control panel.
        </p>
        <div className="rounded-xl bg-zinc-950/80 border border-dark-border p-5 text-xs text-zinc-500 w-full space-y-2">
          <p className="font-bold text-zinc-400">Demo Administrator Account:</p>
          <div className="flex justify-between border-t border-dark-border/40 pt-2 mt-1">
            <span>Email:</span>
            <span className="font-mono text-primary font-bold">admin@rewardcash.co</span>
          </div>
          <div className="flex justify-between">
            <span>Password:</span>
            <span className="font-mono text-secondary font-bold">admin123</span>
          </div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const totalVolumeUSD = withdrawals
    .filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + parseFloat(w.amount_usd), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex-1 flex flex-col justify-start">
      
      {/* Header */}
      <div className="mb-10 text-center md:text-left space-y-2">
        <h1 className="text-3xl font-black text-white flex items-center justify-center md:justify-start gap-2">
          <ShieldAlert className="h-7 w-7 text-red-500" />
          Admin Control Panel
        </h1>
        <p className="text-sm text-zinc-400 max-w-2xl">
          Manage payout requests, audit user balances, and approve withdrawals. Changes update user balances in real time.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 p-4 text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-950/40 border border-red-900/60 p-4 text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl glass-card border border-dark-border p-5 flex items-center gap-4">
              <div className="rounded-xl bg-yellow-950/30 border border-yellow-900/50 p-3 text-yellow-500">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Pending Requests</span>
                <span className="text-xl font-black text-white">{pendingWithdrawals.length} Cashouts</span>
              </div>
            </div>

            <div className="rounded-2xl glass-card border border-dark-border p-5 flex items-center gap-4">
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Registered Users</span>
                <span className="text-xl font-black text-white">{usersList.length} Accounts</span>
              </div>
            </div>

            <div className="rounded-2xl glass-card border border-dark-border p-5 flex items-center gap-4">
              <div className="rounded-xl bg-secondary/10 border border-secondary/20 p-3 text-secondary">
                <Coins className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wide">Approved Payouts</span>
                <span className="text-xl font-black text-white">${totalVolumeUSD.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Admin Tabs */}
          <div className="flex gap-4 border-b border-dark-border pb-3">
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'withdrawals' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Withdrawal Requests ({withdrawals.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all ${
                activeTab === 'users' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              User Accounts Directory ({usersList.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'withdrawals' ? (
            <div className="rounded-2xl glass-card border border-dark-border p-6">
              {withdrawals.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-sm">
                  No withdrawal requests found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-dark-border text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="pb-3 pr-4">User</th>
                        <th className="pb-3 px-4">Method</th>
                        <th className="pb-3 px-4">Amount</th>
                        <th className="pb-3 px-4">Spent Coins</th>
                        <th className="pb-3 px-4">Payout Address</th>
                        <th className="pb-3 px-4">Date</th>
                        <th className="pb-3 px-4">Status</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/40 text-sm">
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="group">
                          <td className="py-3.5 pr-4 font-bold text-white">{w.username}</td>
                          <td className="py-3.5 px-4 font-semibold text-zinc-400 uppercase">{w.payment_method}</td>
                          <td className="py-3.5 px-4 text-primary font-bold">${parseFloat(w.amount_usd).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-zinc-300">{w.coins_spent?.toLocaleString()}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-zinc-500 max-w-[150px] truncate" title={w.payment_address}>{w.payment_address}</td>
                          <td className="py-3.5 px-4 text-zinc-500 text-xs">{new Date(w.created_at).toLocaleDateString()}</td>
                          <td className="py-3.5 px-4">
                            {w.status === 'approved' && <span className="text-xs font-bold text-primary bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/50">Approved</span>}
                            {w.status === 'rejected' && <span className="text-xs font-bold text-red-400 bg-red-950/20 px-2 py-0.5 rounded border border-red-900/50">Rejected</span>}
                            {w.status === 'pending' && <span className="text-xs font-bold text-yellow-500 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/50">Pending</span>}
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            {w.status === 'pending' && (
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => handleUpdateStatus(w.id, 'approved')}
                                  disabled={processingId !== null}
                                  className="rounded bg-emerald-950/40 hover:bg-emerald-900 border border-emerald-800 p-1 text-primary disabled:opacity-50 transition-colors"
                                  title="Approve Withdrawal"
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
                                  className="rounded bg-red-950/40 hover:bg-red-900 border border-red-800 p-1 text-red-400 disabled:opacity-50 transition-colors"
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
          ) : (
            <div className="rounded-2xl glass-card border border-dark-border p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dark-border text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="pb-3 pr-4">User</th>
                      <th className="pb-3 px-4">Email</th>
                      <th className="pb-3 px-4">Register Date</th>
                      <th className="pb-3 px-4 text-right">Current Balance</th>
                      <th className="pb-3 pl-4 text-right">Total Coins Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border/40 text-sm">
                    {usersList.map((usr) => (
                      <tr key={usr.id} className="group">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2.5">
                            <img 
                              src={usr.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                              alt={usr.username}
                              className="h-7 w-7 rounded-full border border-dark-border"
                            />
                            <span className="font-bold text-white">{usr.username}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 font-mono text-xs">{usr.email}</td>
                        <td className="py-3.5 px-4 text-zinc-500 text-xs">{new Date(usr.created_at).toLocaleDateString()}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-primary">
                          <div className="flex items-center justify-end gap-1">
                            <Coins className="h-3.5 w-3.5 text-yellow-500" />
                            {usr.balance_coins?.toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3.5 pl-4 text-right font-semibold text-white">
                          <div className="flex items-center justify-end gap-1">
                            <Coins className="h-3.5 w-3.5 text-yellow-500" />
                            {usr.total_earned_coins?.toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
