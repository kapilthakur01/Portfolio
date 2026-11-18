/**
 * ActivityHeatmap.jsx
 * GitHub-style contribution heatmap.
 * Cell: 10×10px, gap: 2px → column pitch = 12px, row pitch = 12px
 * 7 rows (Sun–Sat), up to maxWeeks columns.
 */
import React, { useMemo } from 'react';
import styles from '../../styles/gui/ActivityWidget.module.css';

// Both GitHub and LeetCode use green cells
const GREEN = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];

const DAY_LABELS = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

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

const CELL = 10;   // cell size px
const GAP  = 2;    // gap px
const PITCH = CELL + GAP; // 12px per column / row

export default function ActivityHeatmap({ weeks = [], variant = 'github', maxWeeks = 52 }) {
  const displayWeeks = useMemo(() => {
    if (weeks.length <= maxWeeks) return weeks;
    return weeks.slice(weeks.length - maxWeeks);
  }, [weeks, maxWeeks]);

  const monthLabels = useMemo(() => buildMonthLabels(displayWeeks), [displayWeeks]);

  if (!displayWeeks.length) {
    return <div className={styles.loading}>Loading activity…</div>;
  }

  const numWeeks = displayWeeks.length;
  const gridW = numWeeks * PITCH - GAP;  // exact pixel width of the cell area
  const gridH = 7 * PITCH - GAP;        // exact pixel height

  return (
    <div className={styles.heatmapWrap}>

      {/* Month labels — absolutely positioned over the grid */}
      <div className={styles.monthRow}>
        <div className={styles.dayLabelSpacer} />
        <div style={{ position: 'relative', flex: 1, height: 12, overflow: 'hidden' }}>
          {monthLabels.map(({ wi, label }) => (
            <span
              key={wi}
              className={styles.monthLabel}
              style={{ position: 'absolute', left: wi * PITCH }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Grid body: day labels + cell grid */}
      <div className={styles.gridBody}>

        {/* Day-of-week labels */}
        <div className={styles.dayLabels}>
          {DAY_LABELS.map((label, i) => (
            <div key={i} className={styles.dayLabel}>{label}</div>
          ))}
        </div>

        {/* Cell grid — fixed pixel size, no flex stretch */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: `repeat(7, ${CELL}px)`,
            gridTemplateColumns: `repeat(${numWeeks}, ${CELL}px)`,
            gap: `${GAP}px`,
            gridAutoFlow: 'column',
            flexShrink: 0,
            overflow: 'hidden',
            width: gridW,
            height: gridH,
          }}
        >
          {displayWeeks.map((week, wi) =>
            week.days.map((day, di) => (
              <div
                key={`${wi}-${di}`}
                style={{
                  width: CELL,
                  height: CELL,
                  borderRadius: 2,
                  backgroundColor: day ? GREEN[day.level ?? 0] : 'transparent',
                  flexShrink: 0,
                }}
                title={day ? `${day.date}: ${day.count}` : ''}
              />
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Less</span>
        {GREEN.map((c, i) => (
          <div key={i} style={{ width: CELL, height: CELL, borderRadius: 2, background: c, flexShrink: 0 }} />
        ))}
        <span className={styles.legendLabel}>More</span>
      </div>
    </div>
  );
}
