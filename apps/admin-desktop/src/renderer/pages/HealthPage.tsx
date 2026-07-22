import React from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

interface Props {
  t: (key: string) => string;
}

// Static mock data — wire to live /platform/v1/health endpoint in production
const DB_METRICS = [
  { labelKey: 'activeConnections',   value: '12 / 100' },
  { labelKey: 'avgQueryExecution',   value: '4.2 ms' },
];
const DB_MIGRATION = { labelKey: 'lastMigrationRun', value: '14-July-2026 — Migration v1.0.8 successful', cls: 'muted' };

const QUEUE_METRICS = [
  { labelKey: 'redisCacheHits',       value: '94.8%' },
  { labelKey: 'bullmqPendingJobs',    value: '0' },
  { labelKey: 'activeWorkers',        value: '4 / 4' },
  { labelKey: 'avgQueueProcessTime',  value: '180 ms' },
];

const SECURITY_METRICS = [
  { labelKey: 'auditLogs24h',         value: '482',  cls: '' },
  { labelKey: 'activeImpersonations', value: '0',    cls: 'danger' },
  { labelKey: 'failedAdminLogins',    value: '0',    cls: '' },
];

export function HealthPage({ t }: Props) {
  return (
    <div>
      <div className="grid-2">
        {/* Database card */}
        <div className="card">
          <h2 className="card-title">
            <Activity size={20} color="var(--color-primary)" aria-hidden />
            {t('dbStatus')}
          </h2>
          <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
            {DB_METRICS.map(({ labelKey, value }) => (
              <div className="metric-card" key={labelKey}>
                <span className="metric-label">{t(labelKey)}</span>
                <span className="metric-value">{value}</span>
              </div>
            ))}
            <div className="metric-card span-2">
              <span className="metric-label">{t(DB_MIGRATION.labelKey)}</span>
              <span className={`metric-value ${DB_MIGRATION.cls}`}>{DB_MIGRATION.value}</span>
            </div>
          </div>
        </div>

        {/* Cache / queue card */}
        <div className="card">
          <h2 className="card-title">
            <Activity size={20} color="var(--color-primary)" aria-hidden />
            {t('cacheJobQueues')}
          </h2>
          <div className="grid-2" style={{ gap: 'var(--space-3)' }}>
            {QUEUE_METRICS.map(({ labelKey, value }) => (
              <div className="metric-card" key={labelKey}>
                <span className="metric-label">{t(labelKey)}</span>
                <span className="metric-value">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security card */}
      <div className="card">
        <h2 className="card-title">
          <ShieldAlert size={20} color="var(--color-primary)" aria-hidden />
          {t('securityAuditing')}
        </h2>
        <div className="grid-3" style={{ gap: 'var(--space-3)' }}>
          {SECURITY_METRICS.map(({ labelKey, value, cls }) => (
            <div className="metric-card" key={labelKey}>
              <span className="metric-label">{t(labelKey)}</span>
              <span className={`metric-value${cls ? ' ' + cls : ''}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
