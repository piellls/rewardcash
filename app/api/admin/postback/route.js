import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/supabaseAdmin';
import { GET as postbackHandler } from '../../postback/route';

// Admin-only helpers for the Postback tab of the admin panel.
// Nothing here ever returns a secret: the page only learns whether each one is set.

const SPIN_OFFERS = ['daily_spin', 'signup_spin'];
const isSet = (name) => Boolean(process.env[name]);

export async function GET(request) {
  try {
    const auth = await authenticate(request, { admin: true });
    if (auth.error) return auth.error;

    const config = {
      postbackSecret: isSet('POSTBACK_SECRET'),
      ogadsPostbackSecret: isSet('OGADS_POSTBACK_SECRET'),
      ogadsApiKey: isSet('OGADS_API_KEY'),
      adblumediaApiKey: isSet('ADBLUMEDIA_API_KEY'),
      adblumediaUserId: isSet('ADBLUMEDIA_USER_ID'),
    };

    const { data: rows, error } = await auth.sb
      .from('completed_offers')
      .select('id, user_id, offer_id, provider, payout_usd, coins_earned, transaction_id, completed_at')
      .not('offer_id', 'in', `(${SPIN_OFFERS.join(',')})`)
      .order('completed_at', { ascending: false })
      .limit(200);
    if (error) {
      console.error('[ADMIN POSTBACK] completed_offers query failed:', error);
      return NextResponse.json({ error: 'Failed to load conversions.' }, { status: 500 });
    }

    // Per network: when the last conversion arrived and how many came in the last 24 hours.
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const byProvider = {};
    for (const r of rows) {
      const key = r.provider || 'unknown';
      const entry = (byProvider[key] ||= { provider: key, lastAt: r.completed_at, last24h: 0 });
      if (new Date(r.completed_at).getTime() >= dayAgo) entry.last24h += 1;
    }

    const recent = rows.slice(0, 25);
    const ids = [...new Set(recent.map((r) => r.user_id))];
    const names = {};
    if (ids.length > 0) {
      const { data: profiles } = await auth.sb.from('profiles').select('id, username').in('id', ids);
      (profiles || []).forEach((p) => { names[p.id] = p.username; });
    }

    return NextResponse.json({
      config,
      providers: Object.values(byProvider),
      recent: recent.map((r) => ({
        id: r.id,
        provider: r.provider,
        username: names[r.user_id] || null,
        payoutUsd: Number(r.payout_usd),
        coins: r.coins_earned,
        transactionId: r.transaction_id,
        completedAt: r.completed_at,
      })),
    });
  } catch (err) {
    console.error('[ADMIN POSTBACK] Server error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// Self-test. Runs the real postback handler on the server with each configured secret and a made-up member id,
// so it proves the secret check and the route work without crediting anyone (a made-up id is answered "1" and ignored),
// and with a wrong secret to prove it is refused.
export async function POST(request) {
  try {
    const auth = await authenticate(request, { admin: true });
    if (auth.error) return auth.error;

    const origin = new URL(request.url).origin;
    const call = async (secret, extra = '') => {
      const query = `secret=${encodeURIComponent(secret)}&aff_sub4=postback-selftest&payout=0.10&transaction_id=selftest_${Date.now()}${extra}`;
      const res = await postbackHandler(new Request(`${origin}/api/postback?${query}`));
      return { status: res.status, body: (await res.text()).slice(0, 80) };
    };

    const checks = [];
    const accepted = async (label, envName, extra) => {
      const secret = process.env[envName];
      if (!secret) {
        checks.push({ name: label, ok: false, detail: `${envName} is not set in Vercel.` });
        return;
      }
      const r = await call(secret, extra);
      const ok = r.status === 200 && r.body.trim() === '1';
      checks.push({ name: label, ok, detail: ok ? 'Accepted (answered 1, nobody was credited).' : `Unexpected answer: ${r.status} ${r.body}` });
    };

    await accepted('Main secret (AdBluMedia)', 'POSTBACK_SECRET', '&provider=selftest');
    await accepted('OGAds secret', 'OGADS_POSTBACK_SECRET', '');

    const wrong = await call(`wrong-${Date.now()}`);
    checks.push({
      name: 'A wrong secret is refused',
      ok: wrong.status === 403,
      detail: wrong.status === 403 ? 'Refused with 403, as it should be.' : `Expected 403, got ${wrong.status}.`,
    });

    return NextResponse.json({ checks });
  } catch (err) {
    console.error('[ADMIN POSTBACK TEST] Server error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
