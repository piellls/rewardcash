import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { COINS_PER_PAYOUT_USD } from '@/lib/cashout';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Offer networks treat a plain "1" as "received" and retry on anything else.
const ok = () => new Response('1', { status: 200, headers: { 'Content-Type': 'text/plain' } });

const firstParam = (params, names) => {
  for (const n of names) {
    const v = params.get(n);
    if (v) return v;
  }
  return null;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Only the offer network knows POSTBACK_SECRET; without it anyone could credit themselves coins.
  const expectedSecret = process.env.POSTBACK_SECRET;
  if (!expectedSecret) {
    console.error('[POSTBACK ERROR] POSTBACK_SECRET is not set; refusing all postbacks.');
    return NextResponse.json({ error: 'Postback not configured.' }, { status: 500 });
  }
  const given = Buffer.from(firstParam(searchParams, ['secret', 'password']) || '');
  const expected = Buffer.from(expectedSecret);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    console.warn('[POSTBACK REJECTED] bad secret');
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  // Different networks name the same fields differently.
  // AdBluMedia's tracker stores our s1 as "s1<value>", so a postback that hands the raw field back
  // carries that prefix. A member id never starts with "s", so taking it off is unambiguous.
  // The first field that holds a member id wins (AdBluMedia also fills sub2 with the account id).
  const CLICK_FIELDS = ['click_id', 'subid', 's1', 'sub5', 'sub1', 'sub2', 'sub3', 'sub4', 'aff_sub4', 'user_id', 'userId'];
  const asMemberId = (v) => (v && /^s1[0-9a-f]{8}-/i.test(v) && UUID_RE.test(v.slice(2)) ? v.slice(2) : v);
  const candidates = CLICK_FIELDS.map((n) => asMemberId(searchParams.get(n))).filter(Boolean);
  const click_id = candidates.find((v) => UUID_RE.test(v)) || candidates[0] || null;
  const payoutStr = (searchParams.get('payout') || searchParams.get('amount') || '0').replace('$', '');
  const provider = (searchParams.get('provider') || searchParams.get('network') || 'cpalead').slice(0, 40);
  // The network's own id for this conversion. It makes a repeated postback harmless.
  const txn = firstParam(searchParams, ['transaction_id', 'txid', 'tid', 'conversion_id', 'lead_id'])?.slice(0, 120) || null;

  console.log(`[POSTBACK RECEIVED] click_id: ${click_id}, payout: ${payoutStr}, provider: ${provider}, txn: ${txn}`);

  // AdBluMedia's {status} is 1 for a conversion and 0 for a chargeback / reversal. A reversal earns nothing;
  // answer "1" so the network does not keep retrying it.
  if (searchParams.get('status') === '0') {
    console.log(`[POSTBACK REVERSAL IGNORED] txn: ${txn}`);
    return ok();
  }

  if (!click_id) {
    return NextResponse.json({ error: 'Missing click_id / tracking user parameter.' }, { status: 400 });
  }

  const payout = parseFloat(payoutStr);
  // $1.00 of payout = 450 coins (see COINS_PER_PAYOUT_USD)
  const coinsEarned = Math.round(payout * COINS_PER_PAYOUT_USD);
  if (!(payout > 0) || payout > 5000 || !(coinsEarned > 0)) {
    return NextResponse.json({ error: 'Invalid payout or coin amounts.' }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Postback not configured.' }, { status: 500 });
  }

  if (!UUID_RE.test(click_id)) {
    console.warn('[POSTBACK WARNING] Invalid UUID format for click_id:', click_id);
    return ok();
  }

  try {
    const { data: result, error } = await supabaseAdmin.rpc('credit_offer', {
      p_user: click_id,
      p_provider: provider,
      p_offer_id: 'cpa_network_offer',
      p_txn: txn,
      p_payout: payout,
      p_coins: coinsEarned,
    });

    if (error) {
      console.error('[POSTBACK ERROR] credit_offer failed:', error);
      return NextResponse.json({ error: 'Failed to credit offer.' }, { status: 500 });
    }

    console.log(`[POSTBACK ${String(result).toUpperCase()}] ${coinsEarned} coins for user ${click_id}`);
    return ok();
  } catch (err) {
    console.error('[POSTBACK EXCEPTION]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
