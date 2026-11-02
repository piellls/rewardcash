'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TURNSTILE_SITE_KEY } from '@/lib/turnstile';

// Cloudflare Turnstile (anti-bot). Shows nothing unless Cloudflare needs the visitor to click: most people are checked
// in the background in a second or two.
//
//   action      label sent to Cloudflare for its reports, for example 'login' or 'register'
//   onToken     called with the token when the check passes, and with '' when the token is gone (expired, reset, failed)
//   onError     called with a short code when the check cannot finish: Cloudflare's own error code, or 'script' (its
//               script could not be loaded), 'render', 'unsupported' (browser too old) or 'slow' (nothing happened for
//               a long time; the widget is shown in case it is waiting for a click)
//   ref.reset() asks for a fresh token. A token works once, so call it after every attempt that used one. It also
//               starts again from scratch when the earlier attempt never got a widget (for example the script was blocked).
//
// Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set.

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
const READY_CALLBACK = '__bbTurnstileReady';
const SCRIPT_TIMEOUT_MS = 15000; // stop waiting for Cloudflare's script after this long
const STUCK_AFTER_MS = 15000; // no token and no word from Cloudflare for this long: show the widget and say so

let loading = null;

// Loads Cloudflare's script once for the whole page and resolves with window.turnstile.
function loadTurnstile() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      let timer = null;
      const fail = (message) => {
        window.clearTimeout(timer);
        loading = null; // allow another try (for example after an ad blocker was switched off)
        script.remove();
        reject(new Error(message));
      };
      timer = window.setTimeout(() => fail('The Turnstile script took too long to load.'), SCRIPT_TIMEOUT_MS);
      window[READY_CALLBACK] = () => {
        window.clearTimeout(timer);
        resolve(window.turnstile);
      };
      script.src = `${SCRIPT_SRC}?render=explicit&onload=${READY_CALLBACK}`;
      script.async = true;
      script.defer = true;
      script.onerror = () => fail('The Turnstile script could not be loaded.');
      document.head.appendChild(script);
    });
  }
  return loading;
}

const TurnstileWidget = forwardRef(function TurnstileWidget({ action, onToken, onError }, ref) {
  const box = useRef(null);
  const widgetId = useRef(null);
  const request = useRef(null); // asks for a token: resets the widget, or draws it again if there is none yet
  // The callbacks Cloudflare holds always call the latest functions, without drawing the widget again
  const handlers = useRef({ onToken, onError });
  useEffect(() => { handlers.current = { onToken, onError }; });
  // Cloudflare tells us when it needs a click; until then the widget takes no room in the form
  const [interactive, setInteractive] = useState(false);

  useImperativeHandle(ref, () => ({
    reset() {
      handlers.current.onToken('');
      request.current?.();
    },
  }), []);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !box.current) return undefined;
    let cancelled = false;
    let stuckTimer = null;
    handlers.current.onToken(''); // a token from an earlier widget (another action) is not used for this one

    const fail = (code) => handlers.current.onError?.(code);
    const stopWatching = () => window.clearTimeout(stuckTimer);
    // If nothing happens for a long time, show the widget (it may be waiting for a click) and tell the visitor
    const startWatching = () => {
      stopWatching();
      stuckTimer = window.setTimeout(() => {
        setInteractive(true);
        fail('slow');
      }, STUCK_AFTER_MS);
    };
    const lostToken = () => {
      handlers.current.onToken('');
      startWatching();
    };

    const draw = (turnstile) => {
      let id;
      try {
        id = turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          theme: 'dark',
          size: 'flexible',
          appearance: 'interaction-only',
          callback: (token) => {
            stopWatching();
            setInteractive(false);
            handlers.current.onToken(token);
          },
          'expired-callback': lostToken,
          'timeout-callback': lostToken,
          // Returning true tells Cloudflare the error is handled, so it does not add its own console warning
          'error-callback': (code) => {
            handlers.current.onToken('');
            fail(String(code || 'error'));
            return true;
          },
          'unsupported-callback': () => {
            stopWatching();
            handlers.current.onToken('');
            fail('unsupported');
            return true;
          },
          'before-interactive-callback': () => {
            stopWatching(); // the visitor has to click now, which can take a while
            setInteractive(true);
          },
          'after-interactive-callback': () => setInteractive(false),
        });
      } catch {
        id = null;
      }
      if (id === null || id === undefined) {
        stopWatching();
        fail('render');
        return;
      }
      widgetId.current = id;
    };

    request.current = () => {
      startWatching();
      if (widgetId.current !== null && window.turnstile) {
        try {
          window.turnstile.reset(widgetId.current);
          return;
        } catch { /* the widget was removed meanwhile: draw it again below */ }
        widgetId.current = null;
      }
      loadTurnstile()
        .then((turnstile) => {
          if (cancelled || !box.current || widgetId.current !== null) return;
          draw(turnstile);
        })
        .catch(() => {
          if (cancelled) return;
          stopWatching();
          fail('script');
        });
    };

    request.current();

    return () => {
      cancelled = true;
      stopWatching();
      request.current = null;
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
