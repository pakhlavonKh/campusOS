import React, { useState } from 'react';
import { CreditCard, Sliders } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  billingPlan: string;
  settings: Record<string, any>;
  createdAt: string;
}

interface Props {
  orgs: Organization[];
  onSaveQuota: (orgId: string, plan: string, students: number, storageGb: number) => Promise<void>;
  t: (key: string) => string;
}

export function BillingPage({ orgs, onSaveQuota, t }: Props) {
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [newPlan, setNewPlan] = useState('');
  const [students, setStudents] = useState(100);
  const [storageGb, setStorageGb] = useState(10);
  const [saving, setSaving] = useState(false);

  const openEditor = (org: Organization) => {
    setEditingOrg(org);
    setNewPlan(org.billingPlan);
    setStudents(org.settings.studentQuota ?? 100);
    setStorageGb(org.settings.storageQuotaGb ?? 10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setSaving(true);
    try {
      await onSaveQuota(editingOrg.id, newPlan, students, storageGb);
      setEditingOrg(null);
    } finally {
      setSaving(false);
    }
  };

  if (editingOrg) {
    return (
      <div className="card">
        <h2 className="card-title">
          <Sliders size={20} color="var(--color-primary)" aria-hidden />
          {t('quotaOverrides')} — {editingOrg.name}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">{t('billingPlanTier')}</label>
              <select
                className="form-control"
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
              >
                <option value="free">{t('free')}</option>
                <option value="growth">{t('growth')}</option>
                <option value="pro">{t('pro')}</option>
                <option value="enterprise">Bespoke Chain (Enterprise)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('maxActiveStudents')}</label>
              <input
                type="number"
                className="form-control"
                value={students}
                onChange={(e) => setStudents(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('storageQuotaGb')}</label>
              <input
                type="number"
                className="form-control"
                value={storageGb}
                onChange={(e) => setStorageGb(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {t('applyChanges')}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditingOrg(null)}>
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">
        <CreditCard size={20} color="var(--color-primary)" aria-hidden />
        {t('resourceLicensingControls')}
      </h2>

      <table className="data-table">
        <thead>
          <tr>
            <th>{t('tenantName')}</th>
            <th>{t('billingPlan')}</th>
            <th>{t('studentLimit')}</th>
            <th>{t('storageLimit')}</th>
            <th>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org) => (
            <tr key={org.id}>
              <td className="col-primary">{org.name}</td>
              <td>
                <span className={`badge badge-${org.billingPlan}`}>{t(org.billingPlan)}</span>
              </td>
              <td className="text-sm">{org.settings.studentQuota ?? 100} students</td>
              <td className="text-sm">{org.settings.storageQuotaGb ?? 10} GB</td>
              <td>
                <button className="btn btn-sm btn-outline" onClick={() => openEditor(org)}>
                  {t('configureLimits')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
