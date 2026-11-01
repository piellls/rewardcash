'use client';

import { useState, useEffect } from 'react';
import { sfx } from '@/lib/sfx';
import { X } from 'lucide-react';
import AuthGateway from './AuthGateway';
import Portal from './Portal';

export default function AuthModal({ isOpen, onClose, defaultTab = 'login', defaultEmail = '' }) {
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (isOpen) sfx.play('open');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        {/* Backdrop */}
        <div className="g-fade fixed inset-0 bg-[#05070d]/80 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <div className="auth-modal g-modal relative z-10 grid max-h-[calc(100dvh-2rem)] w-full max-w-[45rem] overflow-hidden rounded-2xl bg-[var(--bb-surface)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] md:grid-cols-[42%_58%]">
          <div className="auth-modal-art" aria-hidden="true">
            <div className="auth-modal-art-shade" />
            <p>TURN TASKS<br /><span>INTO REWARDS</span></p>
          </div>
          <div className="relative min-w-0 overflow-y-auto p-5 sm:p-6">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <h2 id="auth-title" className="mb-4 pr-9 text-lg font-semibold text-white">{tab === 'login' ? 'Sign in' : 'Sign up'}</h2>
            <AuthGateway mode={tab} onModeChange={setTab} defaultEmail={defaultEmail} onSuccess={onClose} active={isOpen} />
          </div>
        </div>
      </div>
    </Portal>
  );
}
