/**
 * dataService.js — fetches portfolio data from the MongoDB backend API.
 *
 * Primary: GET http://localhost:5000/api/portfolio  (Node/Express + MongoDB)
 * Fallback: local demoData.json (used if the API is not running)
 *
 * All GUI components and CLI commands import from here.
 */

import localData from '../data/demoData.json';
import { getCachedLeetCodeCount } from './leetcodeService.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── In-memory cache for the fetched data ─────────────────────────────────
let _cache = null;
let _fetchPromise = null;

async function fetchPortfolioData() {
  if (_cache) return _cache;
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/portfolio`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      _cache = data;
      return data;
    } catch (err) {
      console.warn('[dataService] API unavailable, using local fallback:', err.message);
      _cache = localData;
      return localData;
    }
  })().finally(() => { _fetchPromise = null; });

  return _fetchPromise;
}

// Synchronous helpers — returns local data until async fetch completes
// (used by GUI components that need data at render time)
let _syncData = null;

function getSyncData() {
  if (_syncData) return _syncData;
  // Kick off async fetch in background
  fetchPortfolioData().then((d) => { _syncData = d; });
  // Return local data for the first synchronous render
  return localData;
}

// ── Async API (used by CLI commands) ─────────────────────────────────────
const resolved = (v) => Promise.resolve(v);

export const getProfile      = async () => { const d = await fetchPortfolioData(); return d.profile; };
export const getSkills       = async () => { const d = await fetchPortfolioData(); return d.skills       ?? []; };
export const getProjects     = async () => { const d = await fetchPortfolioData(); return d.projects     ?? []; };
export const getExperience   = async () => { const d = await fetchPortfolioData(); return d.experience   ?? []; };
export const getEducation    = async () => { const d = await fetchPortfolioData(); return d.education    ?? []; };
export const getAchievements = async () => resolved(getAchievementsSync());
export const getContact      = async () => { const d = await fetchPortfolioData(); return d.contact; };
export const getSocials      = async () => { const d = await fetchPortfolioData(); return d.socials      ?? []; };
export const getGuiConfig    = async () => { const d = await fetchPortfolioData(); return d.gui          ?? {}; };
export const getWidgetsData  = async () => resolved(getWidgetsDataSync());

export async function getProject(id) {
  const projects = await getProjects();
  const project = projects.find((p) => p._id === id || p.slug === id);
  if (!project) return Promise.reject(new Error(`Project not found: ${id}`));
  return project;
}

// ── Synchronous helpers used by GUI components ────────────────────────────
export const getProfileSync      = () => getSyncData().profile;
export const getSkillsSync       = () => getSyncData().skills       ?? [];
export const getProjectsSync     = () => getSyncData().projects     ?? [];
export const getExperienceSync   = () => getSyncData().experience   ?? [];
export const getEducationSync    = () => getSyncData().education    ?? [];
export const getAchievementsSync = () => {
  const list = getSyncData().achievements ?? [];
  const count = getCachedLeetCodeCount();
  return list.map((a) => {
    if (a._id === 'ach_001' || (a.title || '').toLowerCase().includes('leetcode')) {
      return {
        ...a,
        stat: count,
        badge: `${count} Solved`,
        detail: `Solved ${count} problems on LeetCode with consistent practice in Arrays, Trees, Graphs, and Dynamic Programming.`,
      };
    }
    return a;
  });
};
export const getContactSync      = () => getSyncData().contact;
export const getSocialsSync      = () => getSyncData().socials      ?? [];
export const getGuiConfigSync    = () => getSyncData().gui          ?? {};
export const getWidgetsDataSync  = () => {
  const widgets = getSyncData().widgets ?? {};
  const count = getCachedLeetCodeCount();
  if (widgets.dsaFocus) {
    return {
      ...widgets,
      dsaFocus: {
        ...widgets.dsaFocus,
        stat: count,
      },
    };
  }
  return widgets;
};

// ── Contact form submission ────────────────────────────────────────────────
export async function sendContactMessage({ name, email, message }) {
  const res = await fetch(`${API_BASE}/contact/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Invalidate cache (force refetch) ─────────────────────────────────────
export function invalidateCache() {
  _cache = null;
  _syncData = null;
}
