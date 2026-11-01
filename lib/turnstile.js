// Cloudflare Turnstile: the anti-bot check on the email sign-in and sign-up forms.
//
// The site key is public (it is meant to be visible in the page). It is set in Vercel as NEXT_PUBLIC_TURNSTILE_SITE_KEY.
// While it is not set, no check is shown and nothing is required, so the site works exactly as before.
//
// The check is enforced by Supabase Auth, not by this site: the browser sends the Turnstile token with the sign-in or
// sign-up call (captchaToken) and Supabase verifies it with the secret key, which is stored only in the Supabase
// dashboard (Authentication > Attack Protection). That is what stops a bot from skipping the form and calling the
// Supabase API directly. See DEPLOYMENT.md, "Cloudflare Turnstile".
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
export const turnstileEnabled = TURNSTILE_SITE_KEY !== '';
