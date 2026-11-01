'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthForm from './AuthForm';

function GoogleMark() {
  return <span className="auth-google" aria-hidden="true">G</span>;
}

function RobloxMark() {
  return <span className="auth-roblox" aria-hidden="true" />;
}

export default function AuthGateway({ mode, onModeChange, defaultEmail = '', onSuccess, active = true }) {
  const { signInWithSocial } = useAuth();
  const [method, setMethod] = useState('choices');
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');
  const isLogin = mode === 'login';

  useEffect(() => {
    setMethod('choices');
    setError('');
  }, [mode, active]);

  const useGoogle = async () => {
    setError('');
    setSocialLoading(true);
    try {
      const user = await signInWithSocial('google');
      if (user) onSuccess?.();
    } catch (err) {
      setError(err.message || 'Google sign in could not be started.');
      setSocialLoading(false);
    }
  };

  return (
    <div className="auth-gateway">
      <div className="auth-tabs" role="tablist" aria-label="Account action">
        <button type="button" role="tab" aria-selected={isLogin} className={isLogin ? 'active' : ''} onClick={() => onModeChange?.('login')}>Sign in</button>
        <button type="button" role="tab" aria-selected={!isLogin} className={!isLogin ? 'active' : ''} onClick={() => onModeChange?.('register')}>Sign up</button>
      </div>

      {method === 'choices' ? (
        <div className="auth-choice-panel">
          <p>{isLogin ? 'Welcome back! Choose how you would like to sign in.' : 'Create an account to start earning rewards.'}</p>
          {error && <div className="auth-choice-error" role="alert"><AlertCircle size={15} />{error}</div>}
          <button type="button" className="auth-method" onClick={useGoogle} disabled={socialLoading}>
            {socialLoading ? <Loader2 className="animate-spin" size={18} /> : <GoogleMark />}
            {isLogin ? 'Continue with Google' : 'Sign up with Google'}
          </button>
          <button type="button" className="auth-method" disabled aria-label="Roblox login coming soon">
            <RobloxMark />
            {isLogin ? 'Continue with Roblox' : 'Sign up with Roblox'}
            <span className="auth-coming-soon">Coming soon</span>
          </button>
          <button type="button" className="auth-method" onClick={() => setMethod('email')}>
            <Mail size={18} />
            {isLogin ? 'Continue with Email' : 'Sign up with Email'}
          </button>
        </div>
      ) : (
        <div className="auth-email-panel">
          <button type="button" className="auth-back" onClick={() => setMethod('choices')}><ChevronLeft size={17} />All sign-in options</button>
          <AuthForm mode={mode} onModeChange={onModeChange} defaultEmail={defaultEmail} onSuccess={onSuccess} active={active} />
        </div>
      )}

      <p className="auth-legal">By continuing you confirm you are at least 18 years old.</p>
    </div>
  );
}
