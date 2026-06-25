'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Check, Loader2, Sparkles } from 'lucide-react';

const AVATARS = [
  { id: 'av1', url: '/avatars/avatar_1.png', name: 'Excited' },
  { id: 'av2', url: '/avatars/avatar_2.png', name: 'Skeptical' },
  { id: 'av3', url: '/avatars/avatar_3.png', name: 'Sleepy Glasses' },
  { id: 'av4', url: '/avatars/avatar_4.png', name: 'Cool' },
  { id: 'av5', url: '/avatars/avatar_5.png', name: 'Shocked' },
  { id: 'av6', url: '/avatars/avatar_6.png', name: 'Wink' },
  { id: 'av7', url: '/avatars/avatar_7.png', name: 'Angry' },
  { id: 'av8', url: '/avatars/avatar_8.png', name: 'Love' },
  { id: 'av9', url: '/avatars/avatar_9.png', name: 'Nerd' },
  { id: 'av10', url: '/avatars/avatar_10.png', name: 'Meh' }
];

export default function AvatarSelectorModal() {
  const { user, updateAvatar } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState(AVATARS[0].url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only show if user is logged in but hasn't set their avatar yet
  if (!user || user.avatar_url) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUrl) return;
    
    setLoading(true);
    setError('');
    
    try {
      await updateAvatar(selectedUrl);
    } catch (err) {
      setError(err.message || 'Failed to save avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop - click disabled to force selection */}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md" />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg rounded-2xl border border-dark-border bg-dark-card p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Top glowing gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-primary to-secondary" />

        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full filter blur-3xl pointer-events-none" />
        
        <div className="text-center mb-6">
          <div className="inline-flex rounded-2xl bg-primary/10 border border-primary/20 p-3 text-primary mb-3 shadow-[0_0_15px_rgba(56,189,248,0.15)] animate-pulse-slow">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Choose Your Avatar</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto leading-relaxed">
            Welcome to RewardCash! Pick a style to personalize your user profile and finalize your account setup.
          </p>
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-400 bg-red-950/20 border border-red-900/40 p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Grid of avatars */}
          <div className="grid grid-cols-5 gap-4">
            {AVATARS.map((av) => {
              const isSelected = selectedUrl === av.url;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedUrl(av.url)}
                  className={`relative rounded-full aspect-square border-2 transition-all overflow-hidden group active:scale-95 ${
                    isSelected
                      ? 'border-primary shadow-[0_0_15px_rgba(56,189,248,0.35)] scale-105'
                      : 'border-dark-border hover:border-zinc-555'
                  }`}
                >
                  <img
                    src={av.url}
                    alt={av.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="rounded-full bg-primary p-0.5 shadow-md">
                        <Check className="h-3 w-3 text-black stroke-[3.5]" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-primary py-3 text-xs font-black text-black hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-[0_0_15px_rgba(56,189,248,0.25)]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Save & Continue'
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
