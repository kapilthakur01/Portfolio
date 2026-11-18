/**
 * leetcodeActivityService.js
 * Fetches LeetCode submission calendar heatmap + streak stats for EJtucT1f8w.
 */
import { useState, useEffect } from 'react';

const LEETCODE_USERNAME = 'EJtucT1f8w';
const STORAGE_KEY = 'leetcode_activity_v3';
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
  if (c <= 2) return 1;
  if (c <= 5) return 2;
  if (c <= 9) return 3;
  return 4;
}

/**
 * LeetCode returns submissionCalendar as a JSON string of { unixTimestamp: count }
 * We convert to { date, count, level }[] sorted ascending
 */
function parseCalendar(calendarStr) {
  try {
    const obj = typeof calendarStr === 'string' ? JSON.parse(calendarStr) : calendarStr;
    return Object.entries(obj)
      .map(([ts, count]) => {
        const date = new Date(Number(ts) * 1000).toISOString().slice(0, 10);
        return { date, count: Number(count), level: levelFromCount(Number(count)) };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (e) {
    return [];
  }
}

function buildWeeks(days) {
  if (!days || days.length === 0) return [];
  // Fill gaps: generate every day in the range
  const start = new Date(days[0].date + 'T00:00:00');
  const end = new Date(days[days.length - 1].date + 'T00:00:00');
  const map = Object.fromEntries(days.map((d) => [d.date, d]));
  const filled = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    filled.push(map[key] || { date: key, count: 0, level: 0 });
  }

  const weeks = [];
  let week = [];
  const firstDow = new Date(filled[0].date + 'T00:00:00').getDay();
  for (let i = 0; i < firstDow; i++) week.push(null);
  for (const d of filled) {
    week.push(d);
    if (week.length === 7) { weeks.push({ days: week }); week = []; }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push({ days: week });
  }
  return weeks;
}

function computeStats(days, apiStreak = null, apiMaxStreak = null, apiActiveDays = null) {
  let totalActive = 0, maxStreak = 0, cur = 0, currentStreak = 0;
  for (const d of days) {
    if (d.count > 0) { totalActive++; cur++; maxStreak = Math.max(maxStreak, cur); }
    else cur = 0;
  }
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) currentStreak++;
    else break;
  }
  const totalSubmissions = days.reduce((s, d) => s + d.count, 0);
  // Prefer API-provided values when available (more accurate)
  return {
    totalActive:    apiActiveDays  != null ? apiActiveDays  : totalActive,
    maxStreak:      apiMaxStreak   != null ? apiMaxStreak   : maxStreak,
    currentStreak:  apiStreak      != null ? apiStreak      : currentStreak,
    totalSubmissions,
  };
}

export async function fetchLeetcodeActivity(force = false) {
  if (!force) {
    const cached = getFromCache();
    if (cached) return cached;
  }
  if (inFlightPromise) return inFlightPromise;

  inFlightPromise = (async () => {
    // Try alfa-leetcode-api (has submissionCalendar)
    try {
      const res = await fetch(
        `https://alfa-leetcode-api.onrender.com/userProfile/${LEETCODE_USERNAME}`
      );
      if (res.ok) {
        const json = await res.json();
        const cal = json?.submissionCalendar;
        if (cal) {
          const days = parseCalendar(cal);
          const weeks = buildWeeks(days);
          // alfa-leetcode-api returns streak, totalActiveDays, maxStreak at top level
          const apiStreak      = json?.streak       != null ? Number(json.streak)       : null;
          const apiMaxStreak   = json?.maxStreak     != null ? Number(json.maxStreak)    : null;
          const apiActiveDays  = json?.totalActiveDays != null ? Number(json.totalActiveDays) : null;
          const stats = computeStats(days, apiStreak, apiMaxStreak, apiActiveDays);
          const data = {
            weeks,
            ...stats,
            totalSolved: json.totalSolved ?? json.solvedProblem ?? null,
            lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
          saveToCache(data);
          window.dispatchEvent(new CustomEvent('portfolio:leetcodeActivityUpdated', { detail: data }));
          return data;
        }
      }
    } catch (e) {}

    // Try leetcode-stats-api
    try {
      const res = await fetch(
        `https://leetcode-stats-api.herokuapp.com/${LEETCODE_USERNAME}`
      );
      if (res.ok) {
        const json = await res.json();
        const cal = json?.submissionCalendar;
        if (cal) {
          const days = parseCalendar(cal);
          const weeks = buildWeeks(days);
          const apiStreak     = json?.streak       != null ? Number(json.streak)       : null;
          const apiMaxStreak  = json?.maxStreak     != null ? Number(json.maxStreak)    : null;
          const apiActiveDays = json?.totalActiveDays != null ? Number(json.totalActiveDays) : null;
          const stats = computeStats(days, apiStreak, apiMaxStreak, apiActiveDays);
          const data = {
            weeks,
            ...stats,
            totalSolved: json.totalSolved ?? null,
            lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
          saveToCache(data);
          window.dispatchEvent(new CustomEvent('portfolio:leetcodeActivityUpdated', { detail: data }));
          return data;
        }
      }
    } catch (e) {}

    // Return stale cache
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw).data;
    } catch (e) {}
    return null;
  })().finally(() => { inFlightPromise = null; });

  return inFlightPromise;
}

export function useLeetcodeActivity() {
  const [data, setData] = useState(() => getFromCache());

  useEffect(() => {
    let mounted = true;
    function onUpdate(e) {
      if (mounted && e.detail) setData(e.detail);
    }
    window.addEventListener('portfolio:leetcodeActivityUpdated', onUpdate);
    fetchLeetcodeActivity().then((d) => { if (mounted && d) setData(d); });
    return () => {
      mounted = false;
      window.removeEventListener('portfolio:leetcodeActivityUpdated', onUpdate);
    };
  }, []);

  return data;
}
