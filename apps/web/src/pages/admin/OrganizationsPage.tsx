import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Building2 } from 'lucide-react';

const mockOrgs = [
  { id: '1', name: 'Springfield University', domain: 'springfield.edu', users: 4500, status: 'active', plan: 'Enterprise' },
  { id: '2', name: 'Tech Academy Online', domain: 'techacademy.io', users: 1200, status: 'active', plan: 'Pro' },
  { id: '3', name: 'Global High School', domain: 'globalhs.org', users: 850, status: 'suspended', plan: 'Basic' },
  { id: '4', name: 'Metro College District', domain: 'metrocollege.edu', users: 11000, status: 'active', plan: 'Enterprise' },
];

export function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockOrgs.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Organizations</h1>
          <p>Manage platform tenants and their subscription plans</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> New Organization
        </button>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div className="topbar-search" style={{ maxWidth: '400px' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)' }}>
        {filtered.map((org) => (
          <div key={org.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <div className="stat-icon purple" style={{ width: '40px', height: '40px' }}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{org.name}</h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{org.domain}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Users</span>
                <span style={{ fontWeight: 600 }}>{org.users.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Plan</span>
                <span style={{ fontWeight: 600 }}>{org.plan}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Status</span>
                <span className={`badge ${org.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '2px' }}>
                  {org.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
