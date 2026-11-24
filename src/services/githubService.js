/**
 * githubService.js
 * Fetches GitHub contribution calendar for kapilthakur01.
 */
import { useState, useEffect } from 'react';

const GITHUB_USERNAME = 'kapilthakur01';
const STORAGE_KEY = 'github_activity_v4';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

/** Fetch with AbortController timeout to avoid hanging on slow/cold-start APIs */
async function fetchWithTimeout(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

let inFlightPromise = null;

function getFromCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL_MS) return data;
  } catch (e) {}
  return null;
}

function saveToCache(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch (e) {}
}

function levelFromCount(c) {
  if (c === 0) return 0;
  if (c <= 3) return 1;
  if (c <= 6) return 2;
  if (c <= 9) return 3;
  return 4;
}

/** Build an array of week objects [{days: [{date,count,level}|null, ...7]}] */
function buildWeeks(days) {
  if (!days || days.length === 0) return [];
  const weeks = [];
  let week = [];
  const firstDow = new Date(days[0].date + 'T00:00:00').getDay();
  for (let i = 0; i < firstDow; i++) week.push(null);

  for (const d of days) {
    week.push({ date: d.date, count: d.count, level: d.level ?? levelFromCount(d.count) });
    if (week.length === 7) { weeks.push({ days: week }); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push({ days: week });
  }
  return weeks;
}

function computeStats(days) {
  let totalActive = 0, maxStreak = 0, cur = 0, currentStreak = 0;
  for (const d of days) {
    if (d.count > 0) { totalActive++; cur++; maxStreak = Math.max(maxStreak, cur); }
    else cur = 0;
  }
  // Current streak: walk backwards
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) currentStreak++;
    else break;
  }
  return { totalActive, maxStreak, currentStreak };
}

export async function fetchGithubActivity(force = false) {
  if (!force) {
    const cached = getFromCache();
    if (cached) return cached;
  }
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = (async () => {
    /** Helper: try one jogruber endpoint with timeout */
    async function tryJogruber(yearParam, timeoutMs = 15000) {
      try {
        const res = await fetchWithTimeout(
          `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=${yearParam}`,
          timeoutMs
        );
        if (!res.ok) return null;
        const json = await res.json();
        const rawDays = json.contributions || [];
        if (!rawDays.length) return null;
        const total = json.total?.lastYear ?? json.total?.[yearParam] ?? rawDays.reduce((s, d) => s + d.count, 0);
        const weeks = buildWeeks(rawDays);
        const stats = computeStats(rawDays);
        return {
          contributions: total,
          weeks,
          ...stats,
          lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
      } catch (e) {
        return null;
      }
    }

    // 1. Primary: ?y=last (covers the rolling last year)
    let data = await tryJogruber('last', 15000);

    // 2. Fallback: try current year explicitly
    if (!data) {
      data = await tryJogruber(new Date().getFullYear(), 12000);
    }

    // 3. Fallback: try previous year
    if (!data) {
      data = await tryJogruber(new Date().getFullYear() - 1, 12000);
    }

    if (data) {
      saveToCache(data);
      window.dispatchEvent(new CustomEvent('portfolio:githubUpdated', { detail: data }));
      return data;
    }

    // All failed — return stale cache if any
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw).data;
    } catch (e) {}
    return null;
  })().finally(() => { inFlightPromise = null; });

  return inFlightPromise;
}

/** Force-refresh: clears cache and re-fetches from network */
export async function refreshGithubActivity() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  inFlightPromise = null;
  return fetchGithubActivity(true);
}

export function useGithubActivity() {
  const [data, setData] = useState(() => getFromCache());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    function onUpdate(e) {
      if (mounted && e.detail) { setData(e.detail); setLoading(false); }
    }
    window.addEventListener('portfolio:githubUpdated', onUpdate);
    // Show loading spinner only when no cache is available yet
    if (!getFromCache()) setLoading(true);
    fetchGithubActivity().then((d) => {
      if (mounted && d) setData(d);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; window.removeEventListener('portfolio:githubUpdated', onUpdate); };
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const d = await refreshGithubActivity();
      if (d) setData(d);
    } finally {
      setLoading(false);
    }
  }

  return { data, loading, refresh };
}
