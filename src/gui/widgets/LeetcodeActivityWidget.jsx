/**
 * LeetcodeActivityWidget.jsx
 * Redesigned GitHub-style LeetCode Activity card.
 * Reads all data from useLeetcodeActivity() + useLeetCodeCount() — no hardcoding.
 */
import React, { useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useLeetcodeActivity } from '../../services/leetcodeActivityService.js';
import { useLeetCodeCount } from '../../services/leetcodeService.js';

/* ─── Green palette (5 levels, same as GitHub) ─── */
const GREENS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

const CELL   = 10;   // px
const GAP    = 2;    // px
const PITCH  = CELL + GAP;   // 12px per slot

const DAY_ROW_LABELS = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

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
          .toLocaleDateString('en-US', { month: 'short' }),
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
  const diff = Math.round((now - then) / 60000); // minutes
  if (diff < 2)   return 'just now';
  if (diff < 60)  return `${diff} minutes ago`;
  if (diff < 120) return '1 hour ago';
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
      {show && (
        <div style={{
          position: 'absolute',
          bottom: CELL + 6,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0d1117',
          color: '#e6edf3',
          fontSize: 10,
          padding: '3px 7px',
          borderRadius: 5,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          border: '1px solid rgba(255,255,255,0.15)',
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
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
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, padding: '16px 0', textAlign: 'center' }}>
        Loading activity…
      </div>
    );
  }

  const numWeeks = display.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Month labels */}
      <div style={{ display: 'flex', marginLeft: 26 }}>
        <div style={{ position: 'relative', width: numWeeks * PITCH - GAP, height: 14 }}>
          {monthLabels.map(({ wi, label }) => (
            <span key={wi} style={{
              position: 'absolute',
              left: wi * PITCH,
              fontSize: 10,
              color: '#8b949e',
              lineHeight: '14px',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid body */}
      <div style={{ display: 'flex', gap: 4 }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', width: 22, flexShrink: 0 }}>
          {DAY_ROW_LABELS.map((lbl, i) => (
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
                ? `${day.date}: ${day.count} submission${day.count !== 1 ? 's' : ''}`
                : '';
              return (
                <Tooltip key={`${wi}-${di}`} text={tooltipText}>
                  <div style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 2,
                    background: GREENS[level],
                    cursor: day && day.count > 0 ? 'pointer' : 'default',
                    transition: 'opacity 0.1s',
                  }} />
                </Tooltip>
              );
            })
          )}
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
          <div key={i} style={{ width: CELL, height: CELL, borderRadius: 2, background: c, flexShrink: 0 }} />
        ))}
        <span style={{ fontSize: 9, color: '#8b949e', userSelect: 'none' }}>More</span>
      </div>
    </div>
  );
}

/* ─── Stat block ─── */
function Stat({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', lineHeight: 1, fontFamily: 'inherit' }}>
        {value ?? '—'}
      </span>
      <span style={{
        fontSize: 9,
        color: '#8b949e',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        textAlign: 'center',
        lineHeight: 1.3,
        userSelect: 'none',
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
      background: 'rgba(13,17,23,0.72)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderTop: '1px solid rgba(255,255,255,0.18)',
      borderRadius: 16,
      boxSizing: 'border-box',
      padding: '14px 18px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
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
        gap: 0,
        flexShrink: 0,
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 10,
      }}>
        {/* Big left stat */}
        <div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
            {data?.totalSubmissions ?? '—'}
          </div>
          <div style={{ fontSize: 9, color: '#8b949e', marginTop: 3 }}>
            submissions in the past year
          </div>
        </div>

        {/* Right mini stats */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
          <Stat value={data?.totalActive}    label={'Total Active\nDays'} />
          <Stat value={data?.maxStreak}      label={'Max\nStreak'} />
          <Stat value={data?.currentStreak}  label={'Current\nStreak'} />
          <Stat value={totalSolved}           label={'Problems\nSolved'} />
        </div>
      </div>

      {/* ── Heatmap ── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Heatmap weeks={data?.weeks ?? []} maxWeeks={53} />
      </div>
    </div>
  );
}
