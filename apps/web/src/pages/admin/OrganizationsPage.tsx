import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Building2, X } from 'lucide-react';
import { organizationsService, Organization } from '../../api/services/organizations.service';

export function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newPlan, setNewPlan] = useState('Enterprise');

  useEffect(() => {
    async function fetchOrgs() {
      setLoading(true);
      try {
        const res = await organizationsService.listOrganizations();
        if (res.success && res.data) {
          setOrgs(res.data);
        }
      } catch (err) {
        console.warn('Backend organization listing endpoint unreachable or empty.', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newSlug.trim()) return;

    const newOrg: Organization = {
      id: Date.now().toString(),
      name: newName,
      slug: newSlug,
      domain: `${newSlug}.campusos.edu`,
      billingPlan: newPlan,
      status: 'active',
      userCount: 1,
    };

    try {
      await organizationsService.register({
        name: newName,
        slug: newSlug,
        billingPlan: newPlan,
      });
    } catch (err) {
      console.warn('Org register endpoint fallback.', err);
    }

    setOrgs([newOrg, ...orgs]);
    setNewName('');
    setNewSlug('');
    setShowModal(false);
  };

  const filtered = orgs.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Organizations</h1>
          <p>Manage platform tenants and their subscription plans</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
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

      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Fetching organizations from backend...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <p>No organizations found. Click "New Organization" to create a new tenant.</p>
        </div>
      ) : (
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
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {org.domain || `${org.slug}.campusos.edu`}
                    </div>
                  </div>
                </div>
                <button className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                  <MoreHorizontal size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Users</span>
                  <span style={{ fontWeight: 600 }}>{org.userCount || 0}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Plan</span>
                  <span style={{ fontWeight: 600 }}>{org.billingPlan || 'Enterprise'}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Status</span>
                  <span className={`badge ${org.status === 'suspended' ? 'badge-danger' : 'badge-success'}`}>
                    {org.status || 'active'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Organization Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="card" style={{ width: '100%', maxWidth: '450px', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Register New Tenant Organization</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrg}>
              <div className="form-group">
                <label className="form-label">Organization Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Springfield University"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tenant Slug</label>
                <input
                  className="form-input"
                  placeholder="springfield-uni"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Billing Plan</label>
                <select
                  className="form-input"
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                >
                  <option value="Enterprise">Enterprise</option>
                  <option value="Pro">Pro</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
