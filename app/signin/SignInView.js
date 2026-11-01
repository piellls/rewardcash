'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthGateway from '@/components/AuthGateway';
import { Reveal } from '@/components/motion';

export default function SignInView() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('login');

  // Someone who is already signed in has nothing to do here
  useEffect(() => {
    if (!loading && user) router.replace('/earn');
  }, [loading, user, router]);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 pb-10 pt-4 sm:px-6">
      <Reveal className="auth-modal grid w-full max-w-[45rem] self-center overflow-hidden rounded-2xl bg-[var(--bb-surface)] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] md:grid-cols-[42%_58%]">
        <div className="auth-modal-art" aria-hidden="true">
          <div className="auth-modal-art-shade" />
          <p>TURN TASKS<br /><span>INTO REWARDS</span></p>
        </div>
        <div className="p-5 sm:p-6">
          <h1 className="mb-4 text-lg font-semibold text-white">{mode === 'login' ? 'Sign in' : 'Sign up'}</h1>
          <AuthGateway mode={mode} onModeChange={setMode} onSuccess={() => router.push('/earn')} />
        </div>
      </Reveal>
    </div>
  );
}
