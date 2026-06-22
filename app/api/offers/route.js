import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const s1 = searchParams.get('s1') || 'guest';

  // Extract client IP address from headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  let clientIp = '127.0.0.1';
  
  if (forwardedFor) {
    clientIp = forwardedFor.split(',')[0].trim();
  } else {
    clientIp = request.headers.get('x-real-ip') || '127.0.0.1';
  }

  // Get client User-Agent
  const userAgent = request.headers.get('user-agent') || '';

  const apiKey = '784b49bd7b4108039d10fac0f90cc372';
  const userId = '199180';

  try {
    const feedUrl = `https://de6jvomfbm0af.cloudfront.net/public/offers/feed.php?user_id=${userId}&api_key=${apiKey}&ip=${clientIp}&user_agent=${encodeURIComponent(userAgent)}&s1=${s1}`;
    
    console.log(`[API OFFERS] Fetching offers for IP: ${clientIp}, s1: ${s1}`);
    
    const response = await fetch(feedUrl, {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error fetching AdBlueMedia feed:', err);
    return NextResponse.json({ error: 'Failed to fetch offers feed.' }, { status: 500 });
  }
}
