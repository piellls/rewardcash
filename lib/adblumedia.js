// AdBluMedia offer feed: building the request and turning its answer into what the Earn page shows.
// No secrets here. The account id and the offers API key come from the environment (see the route).
import { COINS_PER_PAYOUT_USD } from './cashout';

export const DEFAULT_FEED_URL = 'https://d3r33tlb373kwk.cloudfront.net/public/offers/feed.php';

// The feed returns up to 10 offers for the visitor's country and device.
export const MAX_OFFERS = 10;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// `s1` is how the finished offer is tied back to a member: the member id for signed-in people.
export const cleanSubId = (value) => (value && UUID_RE.test(value) ? value : 'guest');

export function buildFeedUrl({ base = DEFAULT_FEED_URL, userId, apiKey, s1, ip, userAgent }) {
  const url = new URL(base);
  url.searchParams.set('user_id', userId);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('s1', s1);
  if (ip) url.searchParams.set('ip', ip);
  if (userAgent) url.searchParams.set('user_agent', userAgent);
  return url.toString();
}

// What kind of task it is, read from the network's own wording (the feed's category ids are not documented).
export function categorize({ name = '', conversion = '', anchor = '' }) {
  const action = conversion.toLowerCase();
  const about = `${name} ${anchor}`.toLowerCase();
  if (/mobile number|\bpin\b|\bsms\b/.test(action)) return 'Sign-up';
  if (/install|download/.test(action)) return /\bgames?\b|\bplay\b/.test(`${about} ${action}`) ? 'Game' : 'App';
  if (/\bgames?\b|\bplay\b|casino|slot|baccarat|roulette|poker/.test(about)) return 'Game';
  if (/survey|question/.test(action)) return 'Survey';
  return 'Sign-up';
}

const cleanText = (value, max) => String(value ?? '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().slice(0, max);
const httpsOrNull = (value) => {
  const text = cleanText(value, 600);
  return /^https:\/\//i.test(text) ? text : null;
};

// Keeps only offers that are safe and complete enough to show; the reward in coins uses the same rate
// the postback pays by, so the number on the card is the number that arrives.
export function normalizeFeed(raw) {
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  const offers = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const id = cleanText(item.id, 40);
    const url = httpsOrNull(item.url);
    const payout = Number.parseFloat(item.payout);
    const title = cleanText(item.name, 80);
    if (!id || !url || !title || !(payout > 0) || payout > 500 || seen.has(id)) continue;
    seen.add(id);
    const conversion = cleanText(item.conversion, 140);
    offers.push({
      id: `ab_${id}`,
      title,
      description: conversion || 'Complete the task',
      category: categorize({ name: title, conversion, anchor: cleanText(item.anchor, 200) }),
      payout,
      coins: Math.round(payout * COINS_PER_PAYOUT_USD),
      icon: httpsOrNull(item.network_icon),
      url,
      provider: 'AdBluMedia',
    });
    if (offers.length >= MAX_OFFERS) break;
  }
  return offers;
}

// The offers where the member is asked for a phone number or PIN. Those can start a paid subscription,
// so the task dialog says so.
export const needsPhone = (offer) => /mobile number|\bpin\b|\bsms\b/i.test(offer?.description || '');
