/**
 * GithubActivityWidget.jsx
 * Shows GitHub contribution heatmap + stats for kapilthakur01.
 * Data is fetched live from the GitHub contributions API.
 */
import React from 'react';
import { GitGraph, ExternalLink } from 'lucide-react';
import { useGithubActivity } from '../../services/githubService.js';
import ActivityHeatmap from './ActivityHeatmap.jsx';
import styles from '../../styles/gui/ActivityWidget.module.css';
import widgetStyles from '../../styles/gui/Widgets.module.css';

const GITHUB_URL = 'https://github.com/kapilthakur01';

export default function GithubActivityWidget() {
  const data = useGithubActivity();

  return (
    <div className={`${widgetStyles.glassCard} ${styles.activityWidget}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <GitGraph size={13} className={styles.icon} aria-hidden="true" />
          <span className={styles.title}>
            GitHub Activity
            {data?.lastUpdated && (
              <span className={styles.updatedBadge}>· updated {data.lastUpdated}</span>
            )}
          </span>
        </div>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewLink}
          title="View GitHub Profile"
        >
          View profile <ExternalLink size={9} />
        </a>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div>
          <div className={styles.mainStat}>{data?.contributions ?? '—'}</div>
          <div className={styles.mainStatLabel}>contributions in the past year</div>
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
        </div>
      </div>

      {/* Heatmap */}
      <ActivityHeatmap weeks={data?.weeks ?? []} variant="github" maxWeeks={52} />
    </div>
  );
}
