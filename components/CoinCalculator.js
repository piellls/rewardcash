'use client';

import { useRef, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import Art from './Art';
import { sfx } from '@/lib/sfx';
import { fx } from '@/lib/fx';
import { COINS_PER_USD } from '@/lib/cashout';

// "What are my coins worth": drag the slider, watch the dollar value and see which payout methods unlock.
// Uses the real rate and the real minimums (passed in from the same list the withdraw API enforces).
const MAX_COINS = 12000;
const STEP = 100;

export default function CoinCalculator({ payouts }) {
  const [coins, setCoins] = useState(2500);
  const cardRefs = useRef({});
  const unlockedBefore = useRef(payouts.filter((p) => 2500 >= p.min * COINS_PER_USD).length);

  const usd = coins / COINS_PER_USD;
  const pct = (coins / MAX_COINS) * 100;
  const scale = 0.72 + 0.4 * (coins / MAX_COINS);

  const onChange = (e) => {
    const next = Number(e.target.value);
    setCoins(next);
    sfx.play('tick');
    const open = payouts.filter((p) => next >= p.min * COINS_PER_USD);
    if (open.length > unlockedBefore.current) {
      const fresh = open[open.length - 1];
      sfx.play('coin');
      fx.burstAt(cardRefs.current[fresh.key], { coins: 7, sparks: 10 });
    }
    unlockedBefore.current = open.length;
  };

  return (
    <div className="g-card g-ring grid items-center gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10">
      <div className="flex flex-col items-center text-center">
        <div className="w-[170px] transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] sm:w-[220px]" style={{ transform: `scale(${scale})` }}>
          <Art name="coins" size="100%" glow="gold" float />
        </div>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-[var(--bb-muted)]">Your coins are worth</p>
        <p className="g-title text-5xl text-[#f3c76b] tabular-nums sm:text-6xl" aria-live="polite">
          ${usd.toFixed(2)}
        </p>
        <p className="mt-1 text-sm text-[var(--bb-muted)] tabular-nums">{coins.toLocaleString('en-US')} coins</p>
      </div>

      <div>
        <label htmlFor="coin-range" className="block text-sm font-bold text-white">How many coins?</label>
        <input
          id="coin-range"
          type="range"
          min={0}
          max={MAX_COINS}
          step={STEP}
          value={coins}
          onChange={onChange}
          aria-valuetext={`${coins.toLocaleString('en-US')} coins, $${usd.toFixed(2)}`}
          className="g-range mt-3 w-full"
          style={{ '--p': `${pct}%` }}
        />
        <div className="mt-1 flex justify-between text-xs text-[var(--bb-subtle)] tabular-nums">
          <span>0</span><span>{MAX_COINS.toLocaleString('en-US')}</span>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {payouts.map((p) => {
            const need = p.min * COINS_PER_USD;
            const ok = coins >= need;
            return (
              <li
                key={p.key}
                ref={(el) => { cardRefs.current[p.key] = el; }}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-[border-color,background-color,opacity] duration-200 ${
                  ok ? 'border-[#42d8a0]/50 bg-[#42d8a0]/10' : 'border-[var(--bb-border)] bg-[var(--bb-bg)]/50 opacity-70'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold"
                  style={{ color: p.tint, background: `color-mix(in srgb, ${p.tint} 18%, transparent)` }}
                >
                  {p.glyph}
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-sm font-semibold text-white">{p.name}</span>
                  <span className="block text-xs text-[var(--bb-muted)]">{ok ? 'Unlocked' : `from $${p.min}`}</span>
                </span>
                {ok ? <Check className="h-4 w-4 shrink-0 text-[#42d8a0]" aria-hidden="true" /> : <Lock className="h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-[var(--bb-subtle)]">1,000 coins = $1.00. How fast you earn depends on the tasks you pick.</p>
      </div>
    </div>
  );
}
