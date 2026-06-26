import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const s1 = searchParams.get('s1') || 'guest';

  // Get real client IP
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp       = request.headers.get('x-real-ip');
  const cfIp         = request.headers.get('cf-connecting-ip');
  
  let clientIp = cfIp || (forwardedFor ? forwardedFor.split(',')[0].trim() : null) || realIp || '127.0.0.1';

  // Fallback to public US IP if local/private network
  if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('127.') || clientIp.startsWith('192.168.') || clientIp.startsWith('10.') || clientIp.startsWith('172.16.')) {
    clientIp = '8.8.8.8';
  }

  const userAgent = request.headers.get('user-agent') || 'Mozilla/5.0';
  
  // NOTE: User must set OGADS_API_KEY in .env.local
  // Fallback to placeholder if not set
  const apiKey = process.env.OGADS_API_KEY || '45239|Ejln6P32fepqTE4BR6XvcMMoRcTxvQ84jvGZ3Z4J59c8fa64';
  const affiliateId = apiKey.split('|')[0];

  try {
    const feedUrl = `https://appsave.store/api/v1?ip=${encodeURIComponent(clientIp)}&user_agent=${encodeURIComponent(userAgent)}&affiliateid=${encodeURIComponent(affiliateId)}&aff_sub4=${encodeURIComponent(s1)}`;
    
    console.log(`[OGADS OFFERS] Fetching for IP: ${clientIp}, s1: ${s1}, affiliate: ${affiliateId}`);
    
    const response = await fetch(feedUrl, {
      headers: { 
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[OGADS OFFERS] API Error ${response.status}:`, errText);
      return NextResponse.json({ error: `API returned status ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    
    // OGAds typically returns an object with a nested array (e.g., { status: "success", offers: [...] })
    // We'll normalize it to a plain array if needed
    const offersArray = Array.isArray(data) ? data : (data.offers || []);
    
    return NextResponse.json(offersArray);
  } catch (err) {
    console.error('[OGADS OFFERS] Catch Error:', err.message);
    return NextResponse.json({ error: 'Failed to fetch OGAds feed.' }, { status: 500 });
  }
}
