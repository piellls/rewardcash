'use client';

import { useState, useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { sfx } from '@/lib/sfx';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/db';
import { turnstileEnabled } from '@/lib/turnstile';
import TurnstileWidget from './TurnstileWidget';
import { Mail, Lock, User, AlertCircle, Loader2, ShieldAlert, Eye, EyeOff, Zap } from 'lucide-react';

// The sign-in / sign-up form, shared by the dialog, the sign-up card on the home page and the /signin page.
//   mode          'login' | 'register'
//   onModeChange  optional; when given, the "device already registered" notice can switch to sign-in in place
//                 (without it the notice links to /signin)
//   defaultEmail  pre-fills the email field
//   onSuccess     called after a successful login / registration
//   active        set false while the form is hidden so the device check does not run needlessly
//   deviceCheck   'immediate' (default) checks as soon as the form is shown; 'on-focus' waits until the visitor
//                 first touches a field, so a form that sits on a public page costs no request per visit
//
// When NEXT_PUBLIC_TURNSTILE_SITE_KEY is set, the form also runs Cloudflare Turnstile (anti-bot) and sends its token
// with the sign-in / sign-up call, where Supabase Auth verifies it. The check loads at the same moment as the device
// check (see deviceCheck). Without the key, none of this exists and the form behaves as before.
const FIELD =
  'w-full rounded-xl border border-[var(--bb-border)] bg-[var(--bb-bg)] py-3 pl-10 pr-4 text-base text-white placeholder:text-zinc-500 transition-colors focus:border-[#713fe1] focus:outline-none focus:ring-2 focus:ring-[#713fe1]/30';

export default function AuthForm({ mode, onModeChange, defaultEmail = '', onSuccess, active = true, deviceCheck = 'immediate' }) {
  const { login, register } = useAuth();
  const uid = useId();
  const isLogin = mode === 'login';

  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deviceHasAccount, setDeviceHasAccount] = useState(null);
  const [touched, setTouched] = useState(deviceCheck === 'immediate');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaFailed, setCaptchaFailed] = useState(false);
  const captcha = useRef(null);
  const waitingForCheck = turnstileEnabled && touched && !captchaToken;

  // A message about one mode should not follow the visitor to the other. The check restarts for the new mode, so a
  // "could not check" notice from the old one is cleared too (the widget clears the old token itself).
  useEffect(() => { setError(''); setCaptchaFailed(false); }, [mode]);

  useEffect(() => {
    if (mode !== 'register' || !active || !touched) { setDeviceHasAccount(null); return; }
    let alive = true;
    db.checkDeviceHasAccount().then((existing) => { if (alive) setDeviceHasAccount(existing); });
    return () => { alive = false; };
  }, [mode, active, touched]);

  const onCheckToken = (token) => {
    setCaptchaToken(token);
    if (token) setCaptchaFailed(false);
  };

  const retryCheck = () => {
    setCaptchaFailed(false);
    captcha.current?.reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (turnstileEnabled && !captchaToken) {
      setError('One moment, we are checking that you are human. Try again in a few seconds.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password, captchaToken);
      } else {
        if (!username.trim()) throw new Error('Username is required!');
        await register(username, email, password, captchaToken);
      }
      sfx.play('success');
      onSuccess?.();
    } catch (err) {
      sfx.play('error');
      setError(err.message || 'Something went wrong!');
      // A Turnstile token works once, so ask for a new one before the next attempt
      captcha.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div role="alert" className="g-fade mb-4 flex items-start gap-2 rounded-xl border border-[#f17685]/40 bg-[#f17685]/10 p-3 text-sm text-[#f9a4af]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#f17685]" aria-hidden="true" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {deviceHasAccount && !isLogin ? (
        <div className="space-y-4 rounded-2xl border border-[#f17685]/30 bg-[#f17685]/10 px-4 py-6 text-center">
          <div className="inline-flex rounded-full bg-[#f17685]/15 p-3.5 text-[#f17685]">
            <ShieldAlert className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="g-title text-lg text-white">Device already registered</h3>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-[var(--bb-muted)]">
            An account (<strong className="font-bold text-[#c3b2ff]">{deviceHasAccount}</strong>) already exists on this device. To keep rewards fair, only one account per device is allowed.
          </p>
          {onModeChange ? (
            <button type="button" onClick={() => onModeChange('login')} className="btn-gaming w-full rounded-xl py-3 text-xs">
              Sign in to that account
            </button>
          ) : (
            <Link href="/signin" className="btn-gaming flex w-full items-center justify-center rounded-xl py-3 text-xs">
              Sign in to that account
            </Link>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} onFocusCapture={() => setTouched(true)} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor={`${uid}-username`} className="mb-1.5 block text-xs font-bold text-[var(--bb-muted)]">Username</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
                <input
                  id={`${uid}-username`}
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Pick a display name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={FIELD}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor={`${uid}-email`} className="mb-1.5 block text-xs font-bold text-[var(--bb-muted)]">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
              <input
                id={`${uid}-email`}
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={FIELD}
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${uid}-password`} className="mb-1.5 block text-xs font-bold text-[var(--bb-muted)]">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
              <input
                id={`${uid}-password`}
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${FIELD} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
          </div>

          {turnstileEnabled && touched && (
            <TurnstileWidget
              ref={captcha}
              action={isLogin ? 'login' : 'register'}
              onToken={onCheckToken}
              onError={(code) => { console.warn('[Turnstile]', code); setCaptchaFailed(true); }}
            />
          )}

          <button
            type="submit"
            disabled={loading || waitingForCheck}
            className="btn-gaming flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : waitingForCheck && !captchaFailed ? (
              <>
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
                <span>Checking…</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{isLogin ? 'Sign in' : 'Create account'}</span>
              </>
            )}
          </button>

          {captchaFailed && (
            <p role="alert" className="text-center text-xs leading-relaxed text-[var(--bb-muted)]">
              We could not check that you are human. Turn off any VPN or content blocker for this site, then{' '}
              <button type="button" onClick={retryCheck} className="font-bold text-white underline underline-offset-2 hover:text-[#c3b2ff]">try again</button>.
            </p>
          )}
        </form>
      )}
    </>
  );
}
