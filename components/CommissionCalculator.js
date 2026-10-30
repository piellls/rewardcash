'use client';

import { useRef, useState } from 'react';
import { sfx } from '@/lib/sfx';
import { fx } from '@/lib/fx';
import { TIERS, MAX_RATE, estimate, shortUsd, formatUsd } from '@/lib/affiliate';

// "Estimate your commission": two sliders (how many friends, what each earns a month), the ladder as a bar chart
// with the current step lit, and the monthly result. The numbers come from lib/affiliate.js, the same ladder
// the database pays by.
const FRIENDS = { min: 1, max: 100, step: 1 };
const EACH = { min: 5, max: 200, step: 5 };

function Slider({ id, label, value, range, onChange, readout, valueText, minLabel, maxLabel }) {
  const pct = ((value - range.min) / (range.max - range.min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold text-white">{label}</label>
        <output htmlFor={id} className="text-lg font-extrabold tabular-nums text-[#c3b2ff]">{readout}</output>
      </div>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={onChange}
        aria-valuetext={valueText}
        className="g-range mt-2 w-full"
        style={{ '--p': `${pct}%` }}
      />
      <div className="flex justify-between text-xs tabular-nums text-[var(--bb-subtle)]">
        <span>{minLabel}</span><span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function CommissionCalculator({ defaultFriends = 25, defaultEach = 40, className = '' }) {
  const [friends, setFriends] = useState(defaultFriends);
  const [each, setEach] = useState(defaultEach);
  const resultRef = useRef(null);

  const est = estimate(friends, each);
  const prevIndex = useRef(est.index);

  // Sound on every nudge; a small coin burst when the nudge lifts you to a higher step.
  const nudge = (setter) => (e) => {
    const next = Number(e.target.value);
    setter(next);
    sfx.play('tick');
    const f = setter === setFriends ? next : friends;
    const p = setter === setEach ? next : each;
    const idx = estimate(f, p).index;
    if (idx > prevIndex.current) {
      sfx.play('coin');
      fx.burstAt(resultRef.current, { coins: 7, sparks: 10 });
    }
    prevIndex.current = idx;
  };

  const chartLabel = `Commission by what your friends earn together in a month: ${TIERS.map((t) => `${t.rate}% from ${formatUsd(t.from)}`).join(', ')}. Your example is on ${est.rate}%.`;

  return (
    <div className={`g-card g-ring grid gap-8 p-5 sm:p-8 md:grid-cols-2 md:gap-10 ${className}`}>
      <div className="flex flex-col gap-6">
        <Slider
          id="calc-friends"
          label="Friends you invite"
          value={friends}
          range={FRIENDS}
          onChange={nudge(setFriends)}
          readout={friends}
          valueText={`${friends} ${friends === 1 ? 'friend' : 'friends'}`}
          minLabel={FRIENDS.min}
          maxLabel={FRIENDS.max}
        />
        <Slider
          id="calc-each"
          label="Each friend earns per month"
          value={each}
          range={EACH}
          onChange={nudge(setEach)}
          readout={formatUsd(each)}
          valueText={`${formatUsd(each)} per friend per month`}
          minLabel={formatUsd(EACH.min)}
          maxLabel={formatUsd(EACH.max)}
        />

        <div ref={resultRef} className="rounded-2xl border border-[var(--bb-border)] bg-[var(--bb-bg)]/60 p-5 text-center" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--bb-muted)]">You get every month</p>
          <p key={est.rate} className="g-title g-pop mt-1 text-5xl tabular-nums text-[#f3c76b] sm:text-6xl">
            {formatUsd(est.commission, 2)}
          </p>
          <p className="mt-2 text-sm text-[var(--bb-muted)]">
            {friends} {friends === 1 ? 'friend' : 'friends'} × {formatUsd(each)} = <strong className="font-bold text-white tabular-nums">{formatUsd(est.volume)}</strong> a month,
            paid at <strong className="font-bold text-[#c3b2ff]">{est.rate}%</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-col">
        <h3 className="text-sm font-bold text-white">Your rate goes up as your friends earn more</h3>
        <ol role="img" aria-label={chartLabel} className="mt-4 flex h-52 items-end gap-1 sm:gap-1.5">
          {TIERS.map((t, i) => {
            const state = i === est.index ? 'now' : i < est.index ? 'passed' : 'ahead';
            return (
              <li key={t.rate} className="flex h-full min-w-0 flex-1 flex-col justify-end" aria-hidden="true">
                <div
                  className={`relative flex items-start justify-center rounded-t-lg pt-1.5 text-[11px] font-extrabold tabular-nums transition-[background-color,box-shadow,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] sm:text-xs ${
                    state === 'now'
                      ? 'bg-gradient-to-t from-[#6945e4] to-[#7854f7] text-white shadow-[0_0_22px_rgba(120,84,247,0.65)]'
                      : state === 'passed'
                        ? 'bg-[#7854f7]/40 text-white'
                        : 'border border-b-0 border-[var(--bb-border)] bg-[#1c2540] text-[var(--bb-muted)]'
                  }`}
                  style={{ height: `${(t.rate / MAX_RATE) * 100}%` }}
                >
                  {t.rate}%
                  {state === 'now' && <span aria-hidden="true" className="absolute -top-2 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 rounded-[2px] bg-[#f3c76b]" />}
                </div>
              </li>
            );
          })}
        </ol>
        <div aria-hidden="true" className="mt-1.5 flex gap-1 border-t border-[var(--bb-border)] pt-1.5 sm:gap-1.5">
          {TIERS.map((t, i) => (
            <span key={t.rate} className={`min-w-0 flex-1 text-center text-[10px] font-semibold tabular-nums tracking-tight sm:text-[11px] ${i === est.index ? 'text-white' : 'text-[var(--bb-muted)]'}`}>
              {shortUsd(t.from)}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--bb-subtle)]">Under each bar: what your friends earn together in a month to reach it.</p>
        <p className="mt-4 text-sm text-[var(--bb-muted)]" aria-live="polite">
          {est.next
            ? <>Your friends need <strong className="font-bold text-white tabular-nums">{formatUsd(est.toNext)}</strong> more a month to reach <strong className="font-bold text-[#c3b2ff]">{est.next.rate}%</strong>.</>
            : <>That is the top step: <strong className="font-bold text-[#c3b2ff]">{MAX_RATE}%</strong> on everything your friends earn.</>}
        </p>
      </div>

      <p className="text-xs leading-relaxed text-[var(--bb-subtle)] md:col-span-2">
        An estimate, not a promise. Your rate follows what all your friends earn together in a calendar month and applies to everything they earned that month,
        and it starts again at {TIERS[0].rate}% on the 1st. The 100 coin bonus when a friend finishes their first task is on top.
      </p>
    </div>
  );
}
