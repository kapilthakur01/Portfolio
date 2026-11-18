/**
 * ActivityHeatmap.jsx
 * Reusable contribution heatmap grid (GitHub / LeetCode style).
 * Shows last 52 weeks (Sun–Sat columns).
 */
import React, { useMemo } from 'react';
import styles from '../../styles/gui/ActivityWidget.module.css';

// Colors: index = level 0–4
const GITHUB_COLORS = ['#1a1f2e', '#0e4429', '#006d32', '#26a641', '#39d353'];
const LEETCODE_COLORS = ['#1a1f2e', '#f5a623', '#e8820c', '#d6600a', '#c44a08'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHOWN_DAYS = [0, 2, 4]; // Sun, Tue, Thu rows to label

/** Build month labels from weeks */
function buildMonthLabels(weeks) {
  const labels = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const firstDay = week.days.find(Boolean);
    if (!firstDay) return;
    const d = new Date(firstDay.date + 'T00:00:00');
    const m = d.getMonth();
    if (m !== lastMonth) {
      labels.push({ wi, label: d.toLocaleDateString('en-US', { month: 'short' }) });
      lastMonth = m;
    }
  });
  return labels;
}

export default function ActivityHeatmap({ weeks = [], variant = 'github', maxWeeks = 52 }) {
  const colors = variant === 'leetcode' ? LEETCODE_COLORS : GITHUB_COLORS;

  // Only show last maxWeeks weeks
  const displayWeeks = useMemo(() => {
    if (weeks.length <= maxWeeks) return weeks;
    return weeks.slice(weeks.length - maxWeeks);
  }, [weeks, maxWeeks]);

  const monthLabels = useMemo(() => buildMonthLabels(displayWeeks), [displayWeeks]);

  if (!displayWeeks.length) {
    return <div className={styles.loading}>Loading activity…</div>;
  }

  return (
    <div className={styles.heatmapWrap}>
      {/* Month label row */}
      <div className={styles.monthRow}>
        <div className={styles.dayLabelSpacer} />
        <div className={styles.monthLabels} style={{ gridTemplateColumns: `repeat(${displayWeeks.length}, 11px)` }}>
          {displayWeeks.map((_, wi) => {
            const ml = monthLabels.find((m) => m.wi === wi);
            return (
              <div key={wi} className={styles.monthCell}>
                {ml ? <span className={styles.monthLabel}>{ml.label}</span> : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid body: day labels + cell columns */}
      <div className={styles.gridBody}>
        {/* Day-of-week labels */}
        <div className={styles.dayLabels}>
          {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
            <div key={dow} className={styles.dayLabel}>
              {SHOWN_DAYS.includes(dow) ? DAY_LABELS[dow] : ''}
            </div>
          ))}
        </div>

        {/* Week columns */}
        <div className={styles.weeksGrid} style={{ gridTemplateColumns: `repeat(${displayWeeks.length}, 11px)` }}>
          {displayWeeks.map((week, wi) =>
            week.days.map((day, di) => (
              <div
                key={`${wi}-${di}`}
                className={styles.cell}
                style={{ background: day ? colors[day.level ?? 0] : 'transparent' }}
                title={day ? `${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}` : ''}
              />
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Less</span>
        {colors.map((c, i) => (
          <div key={i} className={styles.cell} style={{ background: c }} />
        ))}
        <span className={styles.legendLabel}>More</span>
      </div>
    </div>
  );
}
