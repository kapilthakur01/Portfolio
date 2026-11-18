/**
 * githubService.js
 * Fetches GitHub contribution calendar for kapilthakur01.
 */
import { useState, useEffect } from 'react';

const GITHUB_USERNAME = 'kapilthakur01';
const STORAGE_KEY = 'github_activity_v3';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

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
    // Primary: jogruber contributions API (CORS-friendly)
    try {
      const res = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
      );
      if (res.ok) {
        const json = await res.json();
        const rawDays = json.contributions || [];
        const total = json.total?.lastYear ?? rawDays.reduce((s, d) => s + d.count, 0);
        const weeks = buildWeeks(rawDays);
        const stats = computeStats(rawDays);
        const data = { contributions: total, weeks, ...stats,
          lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) };
        saveToCache(data);
        window.dispatchEvent(new CustomEvent('portfolio:githubUpdated', { detail: data }));
        return data;
      }
    } catch (e) {}

    // Fallback: ghchart svg scrape proxy
    try {
      const res = await fetch(`https://ghchart.rshah.org/kapilthakur01`, { mode: 'no-cors' });
      // no-cors means we can't read it, skip
    } catch (e) {}

    // Return stale cache if any
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw).data;
    } catch (e) {}
    return null;
  })().finally(() => { inFlightPromise = null; });

  return inFlightPromise;
}

export function useGithubActivity() {
  const [data, setData] = useState(() => getFromCache());

  useEffect(() => {
    let mounted = true;
    function onUpdate(e) {
      if (mounted && e.detail) setData(e.detail);
    }
    window.addEventListener('portfolio:githubUpdated', onUpdate);
    fetchGithubActivity().then((d) => { if (mounted && d) setData(d); });
    return () => { mounted = false; window.removeEventListener('portfolio:githubUpdated', onUpdate); };
  }, []);

  return data;
}
