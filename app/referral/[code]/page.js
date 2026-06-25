'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function ReferralRedirect() {
  const router = useRouter();
  const params = useParams();
  const code = params?.code;

  useEffect(() => {
    if (code) {
      // Store the referral code in localStorage
      localStorage.setItem('rc_referred_by', code);
      // Redirect to homepage with ref param to trigger registration modal
      router.push(`/?ref=${code}`);
    } else {
      router.push('/');
    }
  }, [code, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] bg-dark-bg text-white">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">
        Processing Referral Link...
      </p>
    </div>
  );
}
