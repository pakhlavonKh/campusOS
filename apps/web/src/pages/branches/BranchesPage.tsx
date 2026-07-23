import { useState } from 'react';
import { GitBranch, Plus, MapPin, Phone, Settings, Users, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface Branch {
  id: string;
  name: string;
  address: string;
  timezone: string;
  phone: string;
  studentCount: number;
  staffCount: number;
  status: 'active' | 'inactive';
}

const MOCK_BRANCHES: Branch[] = [
  { id: 'b1', name: 'Main Campus',     address: '123 University Ave, New York, NY 10001', timezone: 'America/New_York',    phone: '+1 (212) 555-0101', studentCount: 642, staffCount: 48, status: 'active' },
  { id: 'b2', name: 'North Branch',    address: '456 College Blvd, Brooklyn, NY 11201',   timezone: 'America/New_York',    phone: '+1 (718) 555-0202', studentCount: 381, staffCount: 29, status: 'active' },
  { id: 'b3', name: 'Online Division', address: 'Virtual — Remote Learning Hub',          timezone: 'UTC',                 phone: '+1 (800) 555-0303', studentCount: 261, staffCount: 15, status: 'active' },
  { id: 'b4', name: 'West Annex',      address: '789 Campus Dr, Newark, NJ 07102',        timezone: 'America/New_York',    phone: '+1 (973) 555-0404', studentCount: 0,   staffCount: 0,  status: 'inactive' },
];

export function BranchesPage() {
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (activeMembership?.role || user?.role || user?.roles?.[0] || 'org_admin').toLowerCase();

  const [branches, setBranches] = useState<Branch[]>(MOCK_BRANCHES);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddr, setNewAddr] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const toggleStatus = (id: string) => {
    setBranches((prev) => prev.map((b) => b.id === id ? { ...b, status: b.status === 'active' ? 'inactive' : 'active' } : b));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setBranches([...branches, { id: `b${Date.now()}`, name: newName, address: newAddr, timezone: 'UTC', phone: newPhone, studentCount: 0, staffCount: 0, status: 'active' }]);
    setNewName(''); setNewAddr(''); setNewPhone(''); setShowModal(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Branch Management</h1>
          <p>Configure and manage all organizational branches, locations, and their settings</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Branch</button>
      </div>

      {/* Summary */}
      <div className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-label">Total Branches</div>
          <div className="stat-value">{branches.length}</div>
          <div className="stat-change">{branches.filter((b) => b.status === 'active').length} active</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{branches.reduce((s, b) => s + b.studentCount, 0).toLocaleString()}</div>
          <div className="stat-change">Across all active branches</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Staff</div>
          <div className="stat-value">{branches.reduce((s, b) => s + b.staffCount, 0)}</div>
          <div className="stat-change">Faculty and administrators</div>
        </div>
      </div>

      {/* Branch Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        {branches.map((b) => (
          <div key={b.id} className="card" style={{ opacity: b.status === 'inactive' ? 0.7 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GitBranch size={18} style={{ color: 'var(--color-primary-500)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>{b.name}</div>
                  <span className={`badge ${b.status === 'active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.625rem' }}>{b.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-ghost btn-icon" style={{ width: 30, height: 30 }}><Settings size={14} /></button>
                <button className="btn btn-ghost btn-icon" style={{ width: 30, height: 30 }} onClick={() => toggleStatus(b.id)}>
                  {b.status === 'active' ? <ToggleRight size={16} style={{ color: 'var(--color-success-600)' }} /> : <ToggleLeft size={16} style={{ color: 'var(--text-tertiary)' }} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                <MapPin size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }} />
                {b.address}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <Phone size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                {b.phone}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-6)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Students</div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{b.studentCount}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Staff</div>
                <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{b.staffCount}</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Timezone</div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{b.timezone}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontWeight: 600, fontSize: '1.125rem' }}>Add New Branch</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Branch Name</label>
                <input className="form-input" placeholder="e.g. South Campus" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" placeholder="123 Campus Drive, City, State" value={newAddr} onChange={(e) => setNewAddr(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+1 (555) 000-0000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Branch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
