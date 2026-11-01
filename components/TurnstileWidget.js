'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY } from '@/lib/turnstile';

// Cloudflare Turnstile (anti-bot). Shows nothing unless Cloudflare needs the visitor to click: most people are checked
// in the background in a second or two.
//
//   action      label sent to Cloudflare for its reports, for example 'login' or 'register'
//   onToken     called with the token when the check passes, and with '' when the token is gone (expired, reset, failed)
//   onError     called with Cloudflare's error code (or 'script' if its script could not be loaded)
//   ref.reset() asks for a fresh token. A token works once, so call it after every attempt that used one.
//
// Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set.

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const READY_CALLBACK = '__bbTurnstileReady';

let loading = null;

// Loads Cloudflare's script once for the whole page and resolves with window.turnstile.
function loadTurnstile() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      window[READY_CALLBACK] = () => resolve(window.turnstile);
      const script = document.createElement('script');
      script.src = `${SCRIPT_SRC}?render=explicit&onload=${READY_CALLBACK}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        loading = null; // allow another try (for example after an ad blocker was switched off)
        script.remove();
        reject(new Error('The Turnstile script could not be loaded.'));
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}

const TurnstileWidget = forwardRef(function TurnstileWidget({ action, onToken, onError }, ref) {
  const box = useRef(null);
  const widgetId = useRef(null);
  // The callbacks Cloudflare holds always call the latest functions, without drawing the widget again
  const handlers = useRef({ onToken, onError });
  useEffect(() => { handlers.current = { onToken, onError }; });
  // Cloudflare tells us when it needs a click; until then the widget takes no room in the form
  const [interactive, setInteractive] = useState(false);

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetId.current === null || !window.turnstile) return;
      handlers.current.onToken('');
      try { window.turnstile.reset(widgetId.current); } catch { /* the widget was removed meanwhile */ }
    },
  }), []);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !box.current) return undefined;
    let cancelled = false;
    handlers.current.onToken(''); // a token from an earlier widget (another action) is not used for this one

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !box.current) return;
        widgetId.current = turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          theme: 'dark',
          size: 'flexible',
          appearance: 'interaction-only',
          callback: (token) => handlers.current.onToken(token),
          'expired-callback': () => handlers.current.onToken(''),
          'timeout-callback': () => handlers.current.onToken(''),
          'error-callback': (code) => {
            handlers.current.onToken('');
            handlers.current.onError?.(String(code || 'error'));
          },
          'before-interactive-callback': () => setInteractive(true),
          'after-interactive-callback': () => setInteractive(false),
        });
      })
      .catch(() => { if (!cancelled) handlers.current.onError?.('script'); });

    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetId.current); } catch { /* already gone */ }
      }
      widgetId.current = null;
    };
  }, [action]);

  if (!TURNSTILE_SITE_KEY) return null;

  // Hidden (zero height, no margin) unless Cloudflare asks for a click
  return (
    <div
      ref={box}
      data-turnstile=""
      data-interactive={interactive ? '' : undefined}
      style={interactive ? undefined : { height: 0, margin: 0, overflow: 'hidden' }}
    />
  );
});

export default TurnstileWidget;
