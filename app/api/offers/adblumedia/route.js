import { NextResponse } from 'next/server';
import { buildFeedUrl, cleanSubId, normalizeFeed } from '@/lib/adblumedia';

// Offers from AdBluMedia for the visitor. The account id and the offers API key stay on the server:
//   ADBLUMEDIA_USER_ID   the account id (a number)
//   ADBLUMEDIA_API_KEY   the "API Key Offers" from the AdBluMedia dashboard
//   ADBLUMEDIA_FEED_URL  optional, only if the dashboard shows a different feed address
// The visitor's own IP and browser are sent along so the feed picks offers for their country and device.

const PRIVATE_IP = /^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|::1$|fe80:)/i;

function visitorIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = request.headers.get('cf-connecting-ip') || forwarded || request.headers.get('x-real-ip') || '';
  // Local development has no public address; use a US one so the feed still answers.
  return !ip || PRIVATE_IP.test(ip) ? '8.8.8.8' : ip;
}

export async function GET(request) {
  const userId = process.env.ADBLUMEDIA_USER_ID;
  const apiKey = process.env.ADBLUMEDIA_API_KEY;
  if (!userId || !apiKey) {
    console.error('[ADBLUMEDIA OFFERS] ADBLUMEDIA_USER_ID / ADBLUMEDIA_API_KEY are not set.');
    return NextResponse.json({ error: 'Offers are not configured.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const feedUrl = buildFeedUrl({
    base: process.env.ADBLUMEDIA_FEED_URL || undefined,
    userId,
    apiKey,
    s1: cleanSubId(searchParams.get('s1')),
    ip: visitorIp(request),
    userAgent: request.headers.get('user-agent') || undefined,
  });

  try {
    const response = await fetch(feedUrl, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok) {
      console.error(`[ADBLUMEDIA OFFERS] feed answered ${response.status}`); // never log feedUrl: it holds the key
      return NextResponse.json({ error: 'The offer feed is not available right now.' }, { status: 502 });
    }
    const offers = normalizeFeed(await response.json());
    // Same visitor, same list for a minute: reloading the page does not call the feed again.
    return NextResponse.json(offers, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (err) {
    console.error('[ADBLUMEDIA OFFERS]', err.name === 'TimeoutError' ? 'feed timed out' : err.message);
    return NextResponse.json({ error: 'The offer feed is not available right now.' }, { status: 502 });
  }
}
