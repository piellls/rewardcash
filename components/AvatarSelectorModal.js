'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Check, Loader2, Sparkles } from 'lucide-react';

const AVATARS = [
  { id: 'av1', url: '/avatars/avatar_1.png', name: 'Avatar 1' },
  { id: 'av2', url: '/avatars/avatar_2.png', name: 'Avatar 2' },
  { id: 'av3', url: '/avatars/avatar_3.png', name: 'Avatar 3' },
  { id: 'av4', url: '/avatars/avatar_4.png', name: 'Avatar 4' },
  { id: 'av5', url: '/avatars/avatar_5.png', name: 'Avatar 5' },
  { id: 'av6', url: '/avatars/avatar_6.png', name: 'Avatar 6' },
  { id: 'av7', url: '/avatars/avatar_7.png', name: 'Avatar 7' },
  { id: 'av8', url: '/avatars/avatar_8.png', name: 'Avatar 8' },
  { id: 'av9', url: '/avatars/avatar_9.png', name: 'Avatar 9' },
  { id: 'av10', url: '/avatars/avatar_10.png', name: 'Avatar 10' }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="avatar-title">
      {/* Backdrop: no click-to-close, the user has to pick an avatar once */}
      <div className="g-fade fixed inset-0 bg-[#05070d]/90 backdrop-blur-sm" />

      <div className="g-modal g-neon relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-[var(--bb-surface)] p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#7854f7]/40 bg-[#7854f7]/15 text-[#c3b2ff]">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 id="avatar-title" className="g-title text-2xl text-white">Choose your avatar</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--bb-muted)]">
            Welcome to BlueberryCash. Pick a look for your profile and you are ready to earn.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-4 rounded-xl border border-[#f17685]/40 bg-[#f17685]/10 p-3 text-center text-sm font-semibold text-[#f9a4af]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-5 gap-3 sm:gap-4" role="radiogroup" aria-label="Avatar">
            {AVATARS.map((av) => {
              const isSelected = selectedUrl === av.url;
              return (
                <button
                  key={av.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={av.name}
                  onClick={() => setSelectedUrl(av.url)}
                  className={`group relative aspect-square overflow-hidden rounded-full border-2 transition-[transform,border-color,box-shadow] duration-200 active:scale-95 ${
                    isSelected
                      ? 'scale-105 border-[#7854f7] shadow-[0_0_0_3px_rgba(120,84,247,0.25),0_0_22px_rgba(120,84,247,0.5)]'
                      : 'border-[var(--bb-border)] hover:border-[#7854f7]/60'
                  }`}
                >
                  <img src={av.url} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center bg-[#7854f7]/25">
                      <span className="rounded-full bg-[#7854f7] p-0.5 shadow-md">
                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3.5} aria-hidden="true" />
                      </span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button type="submit" disabled={loading} className="btn-gaming flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : 'Save and continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
