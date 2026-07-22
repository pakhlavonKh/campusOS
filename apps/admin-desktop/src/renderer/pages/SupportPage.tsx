import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
}

interface Props {
  orgs: Organization[];
  onSubmit: (orgId: string, userId: string, reason: string) => Promise<void>;
  t: (key: string) => string;
}

export function SupportPage({ orgs, onSubmit, t }: Props) {
  const [orgId, setOrgId] = React.useState('');
  const [userId, setUserId] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !userId || !reason.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(orgId, userId, reason);
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <ShieldAlert size={20} color="var(--color-primary)" aria-hidden />
        {t('auditedSupportTitle')}
      </h2>
      <p className="card-desc">{t('auditedSupportDesc')}</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '560px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="impersonate-org">{t('selectTargetOrg')}</label>
          <select
            id="impersonate-org"
            className="form-control"
            value={orgId}
            onChange={(e) => setOrgId(e.target.value)}
            required
          >
            <option value="">{t('chooseTenant')}</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="impersonate-user">{t('targetUserId')}</label>
          <input
            id="impersonate-user"
            type="text"
            className="form-control"
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="impersonate-reason">{t('reasonImpersonation')}</label>
          <textarea
            id="impersonate-reason"
            className="form-control"
            rows={4}
            placeholder={t('reasonPlaceholder')}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary mt-5"
          disabled={submitting || !orgId || !userId || !reason.trim()}
        >
          <ShieldAlert size={16} aria-hidden />
          {t('authorizeImpersonation')}
        </button>
      </form>
    </div>
  );
}
