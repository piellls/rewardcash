'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { isMockMode, supabase } from '@/lib/db';
import { X, MessageSquare, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function SupportModal({ isOpen, onClose }) {
  const { user } = useAuth();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
    } catch (err) {
      setError(err.message || 'Failed to submit support ticket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl glass-card border border-dark-border p-6 shadow-2xl transition-all">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 rounded-full bg-primary/10 border border-primary/20 w-12 h-12 flex items-center justify-center text-primary">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">Support Desk</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Submit a support ticket. Administrators check and reply directly in the portal.
          </p>
        </div>

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto rounded-full bg-emerald-950/30 border border-emerald-900/50 w-12 h-12 flex items-center justify-center text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-150">Ticket Submitted Successfully!</h3>
              <p className="text-xs text-zinc-550 mt-1 max-w-xs mx-auto">
                Thank you for contacting us. We have received your message. Our administrators will review it shortly.
              </p>
            </div>
            <button
              onClick={() => { setSuccess(false); onClose(); }}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-black hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Close Support Desk
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-950/30 border border-red-900/50 p-3 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!user ? (
              <div className="text-center py-6 text-sm text-zinc-400 border border-dashed border-dark-border rounded-xl">
                Please log in to submit a support request.
              </div>
            ) : (
              <>
                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-550 mb-1.5">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Missing coins for game offer"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-lg bg-zinc-950 border border-dark-border py-2.5 px-4 text-xs text-white placeholder-zinc-550 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-555 mb-1.5">
                    Explain Your Issue
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Please provide details about the offer name, date completed, and any issue..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg bg-zinc-950 border border-dark-border py-2.5 px-4 text-xs text-white placeholder-zinc-550 focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary py-3 text-sm font-bold text-black hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
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
        )}
      </div>
    </div>
  );
}
