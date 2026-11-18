/**
 * LeetcodeActivityWidget.jsx
 * Shows LeetCode submission heatmap + stats for EJtucT1f8w.
 * Data is fetched live from the LeetCode API.
 */
import React from 'react';
import { Code2, ExternalLink } from 'lucide-react';
import { useLeetcodeActivity } from '../../services/leetcodeActivityService.js';
import { useLeetCodeCount } from '../../services/leetcodeService.js';
import ActivityHeatmap from './ActivityHeatmap.jsx';
import styles from '../../styles/gui/ActivityWidget.module.css';
import widgetStyles from '../../styles/gui/Widgets.module.css';

const LEETCODE_URL = 'https://leetcode.com/u/EJtucT1f8w/';

export default function LeetcodeActivityWidget() {
  const data = useLeetcodeActivity();
  const totalSolved = useLeetCodeCount();

  return (
    <div className={`${widgetStyles.glassCard} ${styles.activityWidget}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Code2 size={13} className={styles.icon} aria-hidden="true" />
          <span className={styles.title}>
            LeetCode Activity
            {data?.lastUpdated && (
              <span className={styles.updatedBadge}>· updated {data.lastUpdated}</span>
            )}
          </span>
        </div>
        <a
          href={LEETCODE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewLink}
          title="View LeetCode Profile"
        >
          View profile <ExternalLink size={9} />
        </a>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div>
          <div className={styles.mainStat}>{data?.totalSubmissions ?? '—'}</div>
          <div className={styles.mainStatLabel}>submissions in the past year</div>
        </div>
        <div className={styles.miniStats}>
          <div className={styles.miniStat}>
            <span className={styles.miniStatVal}>{data?.totalActive ?? '—'}</span>
            <span className={styles.miniStatKey}>Total Active Days</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatVal}>{data?.maxStreak ?? '—'}</span>
            <span className={styles.miniStatKey}>Max Streak</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatVal}>{data?.currentStreak ?? '—'}</span>
            <span className={styles.miniStatKey}>Current Streak</span>
          </div>
          <div className={styles.miniStat}>
            <span className={styles.miniStatVal}>{totalSolved}</span>
            <span className={styles.miniStatKey}>Problems Solved</span>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <ActivityHeatmap weeks={data?.weeks ?? []} variant="leetcode" maxWeeks={52} />
    </div>
  );
}
