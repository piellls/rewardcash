'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Gift } from 'lucide-react';

// Referral codes are short and alphanumeric. Anything else is ignored.
const CODE_RE = /^[A-Za-z0-9_-]{1,32}$/;

export default function ReferralRedirect() {
  const router = useRouter();
  const params = useParams();
  const raw = params?.code;
  let code = '';
  try { code = typeof raw === 'string' ? decodeURIComponent(raw) : ''; } catch { /* malformed escape, treated as no code */ }

  useEffect(() => {
    if (CODE_RE.test(code)) {
      try { localStorage.setItem('rc_referred_by', code); } catch { /* storage can be blocked */ }
      router.replace(`/?ref=${encodeURIComponent(code)}`);
    } else {
      router.replace('/');
    }
  }, [code, router]);

  return (
    <main className="g-fade flex min-h-[60vh] flex-1 flex-col items-center justify-center px-4 text-center" role="status">
      <div className="g-neon g-neon-live flex h-16 w-16 items-center justify-center rounded-2xl text-[#9cf3bf]">
        <Gift className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="g-title mt-5 text-xl text-white">Opening your invite…</p>
      <p className="mt-1 text-sm text-[var(--bb-muted)]">Hang on, we are taking you to BlueberryCash.</p>
    </main>
  );
}
