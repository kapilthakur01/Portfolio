/**
 * LeetcodeActivityWidget.jsx
 * Compact LeetCode Activity card — smaller cells, refresh button, accurate stats.
 */
import React, { useMemo, useState } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { useLeetcodeActivity } from '../../services/leetcodeActivityService.js';
import { useLeetCodeCount } from '../../services/leetcodeService.js';

/* ─── Green palette ─── */
const GREENS = [
  'rgba(255,255,255,0.07)',  // 0: empty
  '#1a4731',                  // 1: low
  '#2d6a4f',                  // 2: medium-low
  '#40916c',                  // 3: medium
  '#52b788',                  // 4: high
];

const CELL  = 10;           // px — compact
const GAP   = 2;            // px
const PITCH = CELL + GAP;   // 12px per slot

const DAY_LABELS = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

function buildMonthLabels(weeks) {
  const labels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const first = week.days.find(Boolean);
    if (!first) return;
    const m = new Date(first.date + 'T00:00:00').getMonth();
    if (m !== lastMonth) {
      labels.push({
        wi,
        label: new Date(first.date + 'T00:00:00')
          .toLocaleDateString('en-US', { month: 'short' }),
      });
      lastMonth = m;
    }
  });
  return labels;
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now  = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return dateStr;
  const diff = Math.round((now - then) / 60000);
  if (diff < 2)    return 'just now';
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 120)  return '1h ago';
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

function Tooltip({ text, children }) {
  const [show, setShow] = useState(false);
  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <div style={{
          position: 'absolute',
          bottom: CELL + 5,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0d1117',
          color: '#e6edf3',
          fontSize: 10,
          padding: '3px 7px',
          borderRadius: 4,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          border: '1px solid rgba(255,255,255,0.15)',
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

function Heatmap({ weeks, maxWeeks = 53 }) {
  const display = useMemo(() => {
    if (!weeks || weeks.length === 0) return [];
    return weeks.length <= maxWeeks ? weeks : weeks.slice(weeks.length - maxWeeks);
  }, [weeks, maxWeeks]);

  const monthLabels = useMemo(() => buildMonthLabels(display), [display]);

  if (!display.length) {
    return (
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, padding: '12px 0', textAlign: 'center' }}>
        Loading…
      </div>
    );
  }

  const numWeeks = display.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Month labels */}
      <div style={{ display: 'flex', marginLeft: 24 }}>
        <div style={{ position: 'relative', width: numWeeks * PITCH - GAP, height: 13 }}>
          {monthLabels.map(({ wi, label }) => (
            <span key={wi} style={{
              position: 'absolute',
              left: wi * PITCH,
              fontSize: 9,
              color: '#8b949e',
              lineHeight: '13px',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: 3 }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', width: 21, flexShrink: 0 }}>
          {DAY_LABELS.map((lbl, i) => (
            <div key={i} style={{
              height: PITCH,
              fontSize: 8,
              color: '#8b949e',
              lineHeight: `${PITCH}px`,
              textAlign: 'right',
              paddingRight: 3,
              userSelect: 'none',
            }}>
              {lbl}
            </div>
          ))}
        </div>

        {/* Cell grid */}
        <div style={{
          display: 'grid',
          gridTemplateRows: `repeat(7, ${CELL}px)`,
          gridTemplateColumns: `repeat(${numWeeks}, ${CELL}px)`,
          rowGap: GAP,
          columnGap: GAP,
          gridAutoFlow: 'column',
          flexShrink: 0,
        }}>
          {display.map((week, wi) =>
            week.days.map((day, di) => {
              const level = day?.level ?? 0;
              const tooltipText = day
                ? day.count > 0
                  ? `${day.date}: ${day.count} submission${day.count !== 1 ? 's' : ''}`
                  : `${day.date}: No submissions`
                : '';
              return (
                <Tooltip key={`${wi}-${di}`} text={tooltipText}>
                  <div style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 2,
                    background: GREENS[level],
                    border: level === 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    cursor: day && day.count > 0 ? 'pointer' : 'default',
                    transition: 'opacity 0.1s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.75'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                  />
                </Tooltip>
              );
            })
          )}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 1 }}>
        <span style={{ fontSize: 8, color: '#8b949e', userSelect: 'none' }}>Less</span>
        {GREENS.map((c, i) => (
          <div key={i} style={{
            width: CELL,
            height: CELL,
            borderRadius: 2,
            background: c,
            border: i === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            flexShrink: 0,
          }} />
        ))}
        <span style={{ fontSize: 8, color: '#8b949e', userSelect: 'none' }}>More</span>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
        {value ?? '—'}
      </span>
      <span style={{
        fontSize: 8,
        color: '#8b949e',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        textAlign: 'center',
        lineHeight: 1.3,
        userSelect: 'none',
        whiteSpace: 'pre-line',
      }}>
        {label}
      </span>
    </div>
  );
}

export default function LeetcodeActivityWidget() {
  const { data, loading, refresh } = useLeetcodeActivity();
  const totalSolved = useLeetCodeCount();
  const updatedText = data?.lastUpdated ? relativeTime(data.lastUpdated) : '';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'rgba(13,17,23,0.75)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderTop: '1px solid rgba(255,255,255,0.18)',
      borderRadius: 14,
      boxSizing: 'border-box',
      padding: '10px 14px 9px',
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e6edf3' }}>
            LeetCode Activity
          </span>
          {updatedText && (
            <span style={{ fontSize: 8, color: '#8b949e', fontFamily: 'monospace' }}>
              {updatedText}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Refresh button */}
          <button
            onClick={refresh}
            disabled={loading}
            title="Refresh LeetCode activity"
            style={{
              background: 'none',
              border: 'none',
              cursor: loading ? 'default' : 'pointer',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              color: '#8b949e',
              transition: 'color 0.15s',
              opacity: loading ? 0.5 : 1,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.color = '#e6edf3'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#8b949e'; }}
          >
            <RefreshCw
              size={10}
              style={{ animation: loading ? 'spin 0.8s linear infinite' : 'none' }}
            />
          </button>
          <a
            href="https://leetcode.com/u/EJtucT1f8w/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: '#8b949e', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
            onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
          >
            View profile <ExternalLink size={8} />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        flexShrink: 0,
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 7,
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {data?.totalSubmissions ?? '—'}
          </div>
          <div style={{ fontSize: 8, color: '#8b949e', marginTop: 2 }}>
            submissions in the past year
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end' }}>
          <Stat value={data?.totalActive}   label={'Total Active\nDays'} />
          <Stat value={data?.maxStreak}     label={'Max\nStreak'} />
          <Stat value={data?.currentStreak} label={'Current\nStreak'} />
          <Stat value={totalSolved}          label={'Problems\nSolved'} />
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Heatmap weeks={data?.weeks ?? []} maxWeeks={53} />
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
