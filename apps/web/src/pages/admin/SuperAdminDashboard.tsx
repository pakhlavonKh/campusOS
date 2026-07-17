import { Building2, Users, HardDrive, Activity } from 'lucide-react';

const stats = [
  { title: 'Total Organizations', value: '42', change: '+3 this month', icon: Building2, color: 'purple' },
  { title: 'Total Active Users', value: '18,245', change: '+1,200 this month', icon: Users, color: 'green' },
  { title: 'Storage Used', value: '2.4 TB', change: '78% of capacity', icon: HardDrive, color: 'amber' },
  { title: 'System Uptime', value: '99.99%', change: 'Last 30 days', icon: Activity, color: 'info' },
];

const recentOrgs = [
  { id: '1', name: 'Springfield University', users: 4500, status: 'active', joined: 'Jan 2024' },
  { id: '2', name: 'Tech Academy Online', users: 1200, status: 'active', joined: 'Feb 2024' },
  { id: '3', name: 'Global High School', users: 850, status: 'onboarding', joined: 'Mar 2024' },
  { id: '4', name: 'Metro College District', users: 11000, status: 'active', joined: 'Mar 2024' },
];

export function SuperAdminDashboard() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Super Admin Console</h1>
          <p>Global platform metrics and organization management</p>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card">
              <div className="card-header">
                <span className="card-title">{stat.title}</span>
                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="card-value">{stat.value}</div>
              <div className="card-change" style={{ color: 'var(--text-tertiary)' }}>
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 style={{ fontSize: '1rem' }}>Recent Organizations</h3>
          <button className="btn btn-ghost btn-sm">View All</button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Organization Name</th>
                <th>Total Users</th>
                <th>Status</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrgs.map((org) => (
                <tr key={org.id}>
                  <td style={{ fontWeight: 500 }}>{org.name}</td>
                  <td>{org.users.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${org.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                      {org.status}
                    </span>
                  </td>
                  <td>{org.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
