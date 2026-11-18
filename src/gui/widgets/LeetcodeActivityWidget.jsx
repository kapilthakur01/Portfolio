/**
 * LeetcodeActivityWidget.jsx
 * GitHub-style LeetCode Activity card — larger cells, month labels at bottom,
 * accurate stats from real API data.
 */
import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLeetcodeActivity } from '../../services/leetcodeActivityService.js';
import { useLeetCodeCount } from '../../services/leetcodeService.js';

/* ─── Green palette — 5 levels, clearly visible on dark bg ─── */
const GREENS = [
  'rgba(255,255,255,0.07)',  // 0: empty — subtle so grid is visible
  '#1a4731',                  // 1: low
  '#2d6a4f',                  // 2: medium-low
  '#40916c',                  // 3: medium
  '#52b788',                  // 4: high — bright mint green
];

const CELL  = 13;   // px — bigger for visibility
const GAP   = 3;    // px
const PITCH = CELL + GAP;   // 16px per slot

const DAY_LABELS = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

/* Build month label positions from the week array */
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
          .toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          .replace(' ', " '"),
      });
      lastMonth = m;
    }
  });
  return labels;
}

/* Relative time helper */
function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now  = Date.now();
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return dateStr; // already a formatted string
  const diff = Math.round((now - then) / 60000);
  if (diff < 2)    return 'just now';
  if (diff < 60)   return `${diff} minutes ago`;
  if (diff < 120)  return '1 hour ago';
  if (diff < 1440) return `${Math.round(diff / 60)} hours ago`;
  return `${Math.round(diff / 1440)} day${Math.round(diff / 1440) > 1 ? 's' : ''} ago`;
}

/* ─── Tooltip ─── */
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
          bottom: CELL + 6,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0d1117',
          color: '#e6edf3',
          fontSize: 10,
          padding: '4px 8px',
          borderRadius: 5,
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

/* ─── Heatmap ─── */
function Heatmap({ weeks, maxWeeks = 53 }) {
  const display = useMemo(() => {
    if (!weeks || weeks.length === 0) return [];
    return weeks.length <= maxWeeks ? weeks : weeks.slice(weeks.length - maxWeeks);
  }, [weeks, maxWeeks]);

  const monthLabels = useMemo(() => buildMonthLabels(display), [display]);

  if (!display.length) {
    return (
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, padding: '20px 0', textAlign: 'center' }}>
        Loading activity…
      </div>
    );
  }

  const numWeeks = display.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Grid body */}
      <div style={{ display: 'flex', gap: 5 }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', width: 24, flexShrink: 0 }}>
          {DAY_LABELS.map((lbl, i) => (
            <div key={i} style={{
              height: PITCH,
              fontSize: 9,
              color: '#8b949e',
              lineHeight: `${PITCH}px`,
              textAlign: 'right',
              paddingRight: 4,
              userSelect: 'none',
            }}>
              {lbl}
            </div>
          ))}
        </div>

        {/* Cell grid */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
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
                      borderRadius: 3,
                      background: GREENS[level],
                      border: level === 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      cursor: day && day.count > 0 ? 'pointer' : 'default',
                      transition: 'opacity 0.1s, transform 0.1s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.8'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
                    />
                  </Tooltip>
                );
              })
            )}
          </div>

          {/* Month labels — below the grid */}
          <div style={{ position: 'relative', width: numWeeks * PITCH - GAP, height: 16, marginTop: 3 }}>
            {monthLabels.map(({ wi, label }) => (
              <span key={wi} style={{
                position: 'absolute',
                left: wi * PITCH,
                fontSize: 9,
                color: '#8b949e',
                lineHeight: '16px',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        marginTop: 2,
      }}>
        <span style={{ fontSize: 9, color: '#8b949e', userSelect: 'none' }}>Less</span>
        {GREENS.map((c, i) => (
          <div key={i} style={{
            width: CELL,
            height: CELL,
            borderRadius: 3,
            background: c,
            border: i === 0 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            flexShrink: 0,
          }} />
        ))}
        <span style={{ fontSize: 9, color: '#8b949e', userSelect: 'none' }}>More</span>
      </div>
    </div>
  );
}

/* ─── Stat block ─── */
function Stat({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', lineHeight: 1, fontFamily: 'inherit' }}>
        {value ?? '—'}
      </span>
      <span style={{
        fontSize: 8,
        color: '#8b949e',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
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

/* ─── Main Widget ─── */
export default function LeetcodeActivityWidget() {
  const data        = useLeetcodeActivity();
  const totalSolved = useLeetCodeCount();

  const updatedText = data?.lastUpdated ? `Updated ${relativeTime(data.lastUpdated)}` : '';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'rgba(13,17,23,0.75)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderTop: '1px solid rgba(255,255,255,0.18)',
      borderRadius: 16,
      boxSizing: 'border-box',
      padding: '12px 16px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      overflow: 'hidden',
      boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#e6edf3',
          }}>
            LeetCode Activity
          </span>
          {updatedText && (
            <span style={{ fontSize: 9, color: '#8b949e', fontFamily: 'monospace' }}>
              {updatedText}
            </span>
          )}
        </div>
        <a
          href="https://leetcode.com/u/EJtucT1f8w/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 10,
            color: '#8b949e',
            textDecoration: 'none',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
          onMouseLeave={e => e.currentTarget.style.color = '#8b949e'}
        >
          View profile <ExternalLink size={9} />
        </a>
      </div>

      {/* ── Stats Row ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        flexShrink: 0,
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 8,
      }}>
        {/* Big left stat */}
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {data?.totalSubmissions ?? '—'}
          </div>
          <div style={{ fontSize: 9, color: '#8b949e', marginTop: 3 }}>
            submissions in the past year
          </div>
        </div>

        {/* Right mini stats */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <Stat value={data?.totalActive}   label={'Total Active\nDays'} />
          <Stat value={data?.maxStreak}     label={'Max\nStreak'} />
          <Stat value={data?.currentStreak} label={'Current\nStreak'} />
          <Stat value={totalSolved}          label={'Problems\nSolved'} />
        </div>
      </div>

      {/* ── Heatmap ── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Heatmap weeks={data?.weeks ?? []} maxWeeks={53} />
      </div>
    </div>
  );
}
