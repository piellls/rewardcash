'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { CheckCircle2, AlertCircle, Loader2, Copy, Check, ExternalLink, PlayCircle, RefreshCw } from 'lucide-react';

const timeAgo = (iso) => {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const Badge = ({ ok, children }) => (
  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.75rem] font-bold ${
    ok ? 'border-[#42d8a0]/40 bg-[#42d8a0]/10 text-[#42d8a0]' : 'border-[#f17685]/40 bg-[#f17685]/10 text-[#f17685]'
  }`}>
    {ok ? <CheckCircle2 className="h-3 w-3" aria-hidden="true" /> : <AlertCircle className="h-3 w-3" aria-hidden="true" />}
    {children}
  </span>
);

// One network: the URL to paste, a box to fill the secret in locally, and how recently it reported a conversion.
function NetworkCard({ title, where, link, template, placeholder, secretSet, stats }) {
  const [secret, setSecret] = useState('');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    // The secret only lives in this box. It is put into the copied text and never sent anywhere.
    const url = secret.trim() ? template.replace(placeholder, encodeURIComponent(secret.trim())) : template;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-white">{title}</h3>
        <Badge ok={secretSet}>{secretSet ? 'Secret is set' : 'Secret missing'}</Badge>
      </div>

      <p className="mb-3 text-xs leading-relaxed text-zinc-400">
        Paste this in {where}
        {link && (
          <>
            {' '}(<a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[#c3b2ff] underline underline-offset-2">open it<ExternalLink className="h-3 w-3" aria-hidden="true" /></a>)
          </>
        )}
        . Keep the macros in braces exactly as they are.
      </p>

      <code className="mb-3 block break-all rounded-xl border border-dark-border bg-dark-bg p-3 text-[0.8125rem] leading-relaxed text-zinc-200">{template}</code>

      <label className="mb-1 block text-[0.8125rem] font-bold text-zinc-400" htmlFor={`secret-${title}`}>
        Your secret (optional: only to fill it into the copied URL, it is not saved or sent)
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={`secret-${title}`}
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Type or paste the secret"
          className="min-h-[2.75rem] flex-1 rounded-xl border border-dark-border bg-dark-bg px-3 text-sm text-white outline-none focus:border-primary"
        />
        <button type="button" onClick={copy} className="btn-gaming inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl px-4 text-xs">
          {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
          {copied ? 'Copied' : secret.trim() ? 'Copy URL with secret' : 'Copy URL'}
        </button>
      </div>

      <p className="mt-3 text-xs text-zinc-400">
        {stats
          ? <>Last conversion <strong className="text-white">{timeAgo(stats.lastAt)}</strong>, <strong className="text-white">{stats.last24h}</strong> in the last 24 hours.</>
          : 'No conversion from this network yet.'}
      </p>
    </div>
  );
}

export default function PostbackPanel() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);
  const [checks, setChecks] = useState(null);
  const [origin, setOrigin] = useState('https://www.blueberrycash.com');

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setInfo(await db.adminGetPostbackInfo());
    } catch (err) {
      setError(err.message || 'Could not load the postback info.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runTest = async () => {
    setTesting(true);
    setChecks(null);
    setError('');
    try {
      const res = await db.adminRunPostbackTest();
      setChecks(res.checks || []);
    } catch (err) {
      setError(err.message || 'The test could not run.');
    } finally {
      setTesting(false);
    }
  };

  const statsFor = (provider) => info?.providers?.find((p) => p.provider === provider);
  const cfg = info?.config || {};

  const adbluTemplate = `${origin}/api/postback?secret=YOUR_POSTBACK_SECRET&provider=adbluemedia&s1={s1}&payout={payout}&transaction_id={lead_id}&status={status}`;
  const ogadsTemplate = `${origin}/api/postback?secret=YOUR_OGADS_POSTBACK_SECRET&aff_sub4={aff_sub4}&payout={payout}&transaction_id={offer_id}_{aff_sub4}_{session_timestamp}`;

  const rows = [
    ['Main postback secret (AdBluMedia)', 'POSTBACK_SECRET', cfg.postbackSecret],
    ['OGAds postback secret', 'OGADS_POSTBACK_SECRET', cfg.ogadsPostbackSecret],
    ['OGAds API key (the offers list)', 'OGADS_API_KEY', cfg.ogadsApiKey],
    ['AdBluMedia API key', 'ADBLUMEDIA_API_KEY', cfg.adblumediaApiKey],
    ['AdBluMedia user id', 'ADBLUMEDIA_USER_ID', cfg.adblumediaUserId],
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-white">Postback setup</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-zinc-400">
            A postback is how an offer network tells the site that a member finished a task, so the coins are added.
            Secrets live in Vercel and are never shown here, only whether each one is set.
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn-gaming-secondary inline-flex min-h-[2.5rem] items-center gap-2 rounded-xl px-3 text-xs disabled:opacity-60">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-[#f17685]/40 bg-[#f17685]/10 p-3 text-xs font-semibold text-[#f17685]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {loading && !info ? (
        <div className="flex items-center gap-2 text-sm text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…</div>
      ) : info && (
        <>
          <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
            <h3 className="mb-3 text-sm font-extrabold text-white">What is set in Vercel</h3>
            <ul className="divide-y divide-dark-border text-xs">
              {rows.map(([label, name, ok]) => (
                <li key={name} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span>
                    <span className="font-bold text-white">{label}</span>
                    <code className="ml-2 text-zinc-500">{name}</code>
                  </span>
                  <Badge ok={Boolean(ok)}>{ok ? 'Set' : 'Missing'}</Badge>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <NetworkCard
              title="AdBluMedia"
              where="the AdBluMedia dashboard, under API → Postback"
              template={adbluTemplate}
              placeholder="YOUR_POSTBACK_SECRET"
              secretSet={Boolean(cfg.postbackSecret)}
              stats={statsFor('adbluemedia')}
            />
            <NetworkCard
              title="OGAds"
              where="OGAds, under Tools → Postback URL"
              link="https://members.ogads.com/tools/postback-url"
              template={ogadsTemplate}
              placeholder="YOUR_OGADS_POSTBACK_SECRET"
              secretSet={Boolean(cfg.ogadsPostbackSecret)}
              stats={statsFor('ogads')}
            />
          </div>

          <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-extrabold text-white">Self-test</h3>
                <p className="mt-1 text-xs text-zinc-400">Sends a made-up member id to the postback with each secret. Nobody is credited.</p>
              </div>
              <button type="button" onClick={runTest} disabled={testing} className="btn-gaming inline-flex min-h-[2.75rem] items-center gap-2 rounded-xl px-4 text-xs disabled:opacity-60">
                {testing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <PlayCircle className="h-4 w-4" aria-hidden="true" />}
                Run test
              </button>
            </div>
            {checks && (
              <ul className="divide-y divide-dark-border text-xs">
                {checks.map((c) => (
                  <li key={c.name} className="flex items-start justify-between gap-3 py-2.5">
                    <span>
                      <span className="font-bold text-white">{c.name}</span>
                      <span className="mt-0.5 block text-zinc-400">{c.detail}</span>
                    </span>
                    <Badge ok={c.ok}>{c.ok ? 'Pass' : 'Fail'}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-dark-border bg-dark-card p-5">
            <h3 className="mb-3 text-sm font-extrabold text-white">Latest conversions</h3>
            {info.recent.length === 0 ? (
              <p className="text-xs text-zinc-400">No conversion has arrived yet. Complete one real offer to see it here.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-dark-border text-zinc-500">
                      <th className="py-2 pr-3 font-bold">When</th>
                      <th className="py-2 pr-3 font-bold">Network</th>
                      <th className="py-2 pr-3 font-bold">Member</th>
                      <th className="py-2 pr-3 font-bold">Payout</th>
                      <th className="py-2 pr-3 font-bold">Coins</th>
                      <th className="py-2 font-bold">Transaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-border text-zinc-300">
                    {info.recent.map((r) => (
                      <tr key={r.id}>
                        <td className="whitespace-nowrap py-2 pr-3">{timeAgo(r.completedAt)}</td>
                        <td className="py-2 pr-3 font-bold text-white">{r.provider}</td>
                        <td className="py-2 pr-3">{r.username || 'unknown'}</td>
                        <td className="whitespace-nowrap py-2 pr-3 tabular-nums">${r.payoutUsd.toFixed(2)}</td>
                        <td className="py-2 pr-3 tabular-nums text-[#f3c76b]">{r.coins.toLocaleString()}</td>
                        <td className="max-w-[14rem] truncate py-2 text-zinc-500" title={r.transactionId || ''}>{r.transactionId || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
