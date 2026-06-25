import { NextResponse } from 'next/server';

// Check if the current visitor has completed any AdBlueMedia leads
export async function GET() {
  try {
    // testing=0 for production, testing=1 for test leads
    const url = 'https://de6jvomfbm0af.cloudfront.net/public/external/check2.php?testing=0&callback=?';
    const res = await fetch(url, { cache: 'no-store' });

    if (!res.ok) throw new Error(`check2 status ${res.status}`);

    // AdBlueMedia wraps in JSONP even with callback=? in URL from server
    // Try to parse as plain JSON first, then strip JSONP wrapper
    let text = await res.text();
    
    // Strip JSONP callback if present: ?([ ... ])
    const jsonpMatch = text.match(/^\?\((\[.*\])\)$/s);
    if (jsonpMatch) text = jsonpMatch[1];

    const leads = JSON.parse(text);
    return NextResponse.json(Array.isArray(leads) ? leads : []);
  } catch (err) {
    console.error('[CHECK-LEADS]', err.message);
    return NextResponse.json([]);
  }
}
