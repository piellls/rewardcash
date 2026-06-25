import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const simulate = searchParams.get('simulate');

    // Developer simulation mode for local testing
    if (simulate === '1') {
      return NextResponse.json({
        isVPN: true,
        ip: '185.220.101.5',
        country: 'Germany',
        provider: 'Tor Exit Node (Simulated)'
      });
    }

    // Extract client IP address from request headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    let ip = '127.0.0.1';
    
    if (forwarded) {
      ip = forwarded.split(',')[0].trim();
    } else if (realIp) {
      ip = realIp.trim();
    }

    // Bypass checking for local development network IPs
    if (
      ip === '127.0.0.1' || 
      ip === '::1' || 
      ip.startsWith('192.168.') || 
      ip.startsWith('10.') || 
      ip.startsWith('172.16.')
    ) {
      return NextResponse.json({ isVPN: false, ip, reason: 'Local/Private IP Address' });
    }

    // Call ip-api.com from server side to bypass mixed-content HTTPS restrictions
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,hosting,proxy,query,isp`);
    const data = await response.json();
    
    if (data && data.status === 'success') {
      // hosting = true (data center / VPN server), proxy = true (web proxy / VPN)
      const isVPN = data.hosting === true || data.proxy === true;
      return NextResponse.json({ 
        isVPN, 
        ip, 
        country: data.country || 'Unknown', 
        provider: data.isp || 'Unknown' 
      });
    }
    
    return NextResponse.json({ isVPN: false, ip, status: 'API lookup error' });
  } catch (err) {
    console.error('VPN detection server error:', err);
    return NextResponse.json({ isVPN: false, error: err.message }, { status: 500 });
  }
}
