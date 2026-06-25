import { NextResponse } from 'next/server';

// This route now just proxies AdBlueMedia with the real client IP
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const s1 = searchParams.get('s1') || 'guest';

  // Get real client IP from headers (works behind Vercel/Nginx proxies)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp       = request.headers.get('x-real-ip');
  const cfIp         = request.headers.get('cf-connecting-ip'); // Cloudflare
  
  let clientIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp || null;

  const userAgent = request.headers.get('user-agent') || '';
  const apiKey    = '784b49bd7b4108039d10fac0f90cc372';
  const userId    = '199180';

  // Build URL — only add ip param if we have a real non-localhost IP
  let feedUrl = `https://de6jvomfbm0af.cloudfront.net/public/offers/feed.php?user_id=${userId}&api_key=${apiKey}&s1=${s1}&s2=`;
  if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
    feedUrl += `&ip=${encodeURIComponent(clientIp)}`;
  }
  if (userAgent) {
    feedUrl += `&user_agent=${encodeURIComponent(userAgent)}`;
  }

  console.log(`[OFFERS] ip=${clientIp || 'not set'} s1=${s1}`);

  try {
    const response = await fetch(feedUrl, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error(`AdBlueMedia status ${response.status}`);

    const data = await response.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('[OFFERS] Error:', err.message);
    return NextResponse.json([]);
  }
}
