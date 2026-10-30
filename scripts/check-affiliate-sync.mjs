// Checks that the commission ladder in lib/affiliate.js (dollars) and public.referral_rate in
// tiered_referrals.sql (coins) are the same. Run it after changing either one:
//   node scripts/check-affiliate-sync.mjs
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const js = readFileSync(new URL('lib/affiliate.js', root), 'utf8');
const sql = readFileSync(new URL('tiered_referrals.sql', root), 'utf8');
const COINS_PER_USD = Number(readFileSync(new URL('lib/cashout.js', root), 'utf8').match(/COINS_PER_USD\s*=\s*(\d+)/)?.[1]);

const jsTiers = [...js.matchAll(/\{\s*rate:\s*(\d+),\s*from:\s*(\d+)\s*\}/g)].map((m) => ({ rate: +m[1], coins: +m[2] * COINS_PER_USD }));
const body = sql.match(/FUNCTION public\.referral_rate[\s\S]*?\$\$;/)?.[0] ?? '';
const sqlTiers = [
  ...[...body.matchAll(/WHEN p_friends_coins >=\s*(\d+) THEN (\d+)/g)].map((m) => ({ rate: +m[2], coins: +m[1] })),
  ...[...body.matchAll(/ELSE (\d+)/g)].map((m) => ({ rate: +m[1], coins: 0 })),
].sort((a, b) => a.coins - b.coins);

const same = jsTiers.length > 0 && jsTiers.length === sqlTiers.length && jsTiers.every((t, i) => t.rate === sqlTiers[i].rate && t.coins === sqlTiers[i].coins);

if (!same) {
  console.error('Ladder mismatch.\n lib/affiliate.js:', JSON.stringify(jsTiers), '\n tiered_referrals.sql:', JSON.stringify(sqlTiers));
  process.exit(1);
}
console.log(`OK: ${jsTiers.length} steps match (${jsTiers.map((t) => `${t.rate}% from ${t.coins.toLocaleString('en-US')} coins`).join(', ')})`);
