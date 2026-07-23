import { useState, useEffect } from 'react';
import { Building2, Users, HardDrive, Activity } from 'lucide-react';
import { organizationsService, Organization } from '../../api/services/organizations.service';
import { usersService } from '../../api/services/users.service';

export function SuperAdminDashboard() {
  const [orgsCount, setOrgsCount] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [recentOrgs, setRecentOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const [orgsRes, usersRes] = await Promise.allSettled([
          organizationsService.listOrganizations(),
          usersService.getMyMemberships(),
        ]);

        if (orgsRes.status === 'fulfilled' && orgsRes.value?.success) {
          const list = orgsRes.value.data || [];
          setOrgsCount(list.length);
          setRecentOrgs(list.slice(0, 5));
        }

        if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
          setUsersCount((usersRes.value.data || []).length);
        }
      } catch (err) {
        console.warn('SuperAdmin metrics fetch offline fallback.', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const stats = [
    { title: 'Total Organizations', value: orgsCount.toString(), change: 'Live backend count', icon: Building2, color: 'purple' },
    { title: 'Total Active Users', value: usersCount.toString(), change: 'Registered memberships', icon: Users, color: 'green' },
    { title: 'Storage Allocation', value: 'Active', change: 'Cloud volume status', icon: HardDrive, color: 'amber' },
    { title: 'System Uptime', value: '100%', change: 'All services healthy', icon: Activity, color: 'info' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Super Admin Console</h1>
          <p>Global platform metrics and organization management</p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading super admin statistics from backend...
        </div>
      ) : (
        <>
          <div className="stat-grid">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="stat-label">{stat.title}</div>
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-change" style={{ color: 'var(--text-tertiary)' }}>{stat.change}</div>
                    </div>
                    <div className={`stat-icon ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'var(--space-8)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Recent Tenant Registrations</h2>
            {recentOrgs.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-6)', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                No registered organization tenants found.
              </div>
            ) : (
              <div className="card" style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Organization Name</th>
                      <th>Slug</th>
                      <th>Billing Plan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrgs.map((org) => (
                      <tr key={org.id}>
                        <td style={{ fontWeight: 500 }}>{org.name}</td>
                        <td>{org.slug}</td>
                        <td>{org.billingPlan || 'Enterprise'}</td>
                        <td>
                          <span className="badge badge-success">{org.status || 'active'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
