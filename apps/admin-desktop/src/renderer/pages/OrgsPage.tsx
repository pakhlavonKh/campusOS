import React from 'react';
import { Building2, Loader2 } from 'lucide-react';

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
  loading: boolean;
  onToggleStatus: (org: Organization) => void;
  t: (key: string) => string;
}

export function OrgsPage({ orgs, loading, onToggleStatus, t }: Props) {
  return (
    <div className="card">
      <h2 className="card-title">
        <Building2 size={20} color="var(--color-primary)" aria-hidden />
        {t('activeTenants')}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center" style={{ padding: '48px' }}>
          <Loader2 size={28} className="spinner" color="var(--color-primary)" />
        </div>
      ) : (
        <div className="table-container" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('tenantName')}</th>
                <th>{t('slugIdentifier')}</th>
                <th>{t('billingPlan')}</th>
                <th>{t('status')}</th>
                <th>{t('createdDate')}</th>
                <th>{t('securityControl')}</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id}>
                  <td className="col-primary">{org.name}</td>
                  <td>
                    <code className="font-mono text-xs">{org.slug}</code>
                  </td>
                  <td>
                    <span className={`badge badge-${org.billingPlan}`}>
                      {t(org.billingPlan)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${org.status}`}>
                      {t(org.status) || org.status}
                    </span>
                  </td>
                  <td className="text-sm">
                    {new Date(org.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${org.status === 'active' ? 'btn-danger-ghost' : 'btn-outline'}`}
                      onClick={() => onToggleStatus(org)}
                    >
                      {org.status === 'active' ? t('suspendTenant') : t('activateTenant')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
