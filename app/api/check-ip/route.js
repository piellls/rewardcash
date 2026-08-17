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
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,hosting,proxy,query,isp`);
    const data = await response.json();
    
    if (data && data.status === 'success') {
      const ispLower = (data.isp || '').toLowerCase();
      const orgLower = (data.org || '').toLowerCase();
      
      const isKnownDatacenterOrVPN = 
        ispLower.includes('digitalocean') ||
        ispLower.includes('vultr') ||
        ispLower.includes('linode') ||
        ispLower.includes('hetzner') ||
        ispLower.includes('ovh') ||
        ispLower.includes('aws') ||
        ispLower.includes('amazon') ||
        ispLower.includes('google cloud') ||
        ispLower.includes('azure') ||
        ispLower.includes('expressvpn') ||
        ispLower.includes('nordvpn') ||
        ispLower.includes('surfshark') ||
        ispLower.includes('mullvad') ||
        ispLower.includes('cyberghost') ||
        ispLower.includes('tor exit') ||
        orgLower.includes('hosting') ||
        orgLower.includes('vpn');

      const isMoroccanISP = 
        data.countryCode === 'MA' || 
        ispLower.includes('maroc telecom') || 
        ispLower.includes('iam') || 
        ispLower.includes('orange') || 
        ispLower.includes('inwi') || 
        ispLower.includes('wana');

      let isVPN = false;
      if (data.proxy === true) {
        isVPN = true;
      } else if (data.hosting === true) {
        // Moroccan residential ISPs use CGNAT which ip-api incorrectly flags as hosting.
        // Ignore hosting flag for Moroccan residential connections unless explicit VPN/Datacenter is matched.
        if (isMoroccanISP && !isKnownDatacenterOrVPN) {
          isVPN = false;
        } else {
          isVPN = true;
        }
      } else if (isKnownDatacenterOrVPN) {
        isVPN = true;
      }
      
      // Convert countryCode to flag emoji
      let flag = '🌍';
      const countryCode = data.countryCode;
      if (countryCode && countryCode.length === 2) {
        const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map(char => 127397 + char.charCodeAt(0));
        flag = String.fromCodePoint(...codePoints);
      }

      return NextResponse.json({ 
        isVPN, 
        ip, 
        country: flag, 
        countryName: data.country || 'Unknown',
        provider: data.isp || 'Unknown' 
      });
    }
    
    return NextResponse.json({ isVPN: false, ip, status: 'API lookup error' });
  } catch (err) {
    console.error('VPN detection server error:', err);
    return NextResponse.json({ isVPN: false, error: err.message }, { status: 500 });
  }
}
