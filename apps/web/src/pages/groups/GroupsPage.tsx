import { useState } from 'react';
import { Users, Plus, BookOpen, X, Search, Edit2, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface Group {
  id: string;
  name: string;
  type: 'class' | 'cohort' | 'study' | 'extracurricular';
  memberCount: number;
  course?: string;
  description: string;
  createdBy: string;
}

const TYPE_CONFIG: Record<Group['type'], { label: string; color: string }> = {
  class:          { label: 'Class',          color: '#6366f1' },
  cohort:         { label: 'Cohort',         color: '#10b981' },
  study:          { label: 'Study Group',    color: '#f59e0b' },
  extracurricular:{ label: 'Extracurricular',color: '#ec4899' },
};

const MOCK_GROUPS: Group[] = [
  { id: 'g1', name: 'CS301 — Section A',          type: 'class',           memberCount: 28, course: 'CS301',    description: 'Data Structures & Algorithms — Morning Section',   createdBy: 'Dr. Smith' },
  { id: 'g2', name: '2026 Engineering Cohort',    type: 'cohort',          memberCount: 92, description: 'All engineering faculty enrollees for the 2026 academic year', createdBy: 'Admin' },
  { id: 'g3', name: 'Algorithm Study Circle',     type: 'study',           memberCount: 6,  course: 'CS301',    description: 'Peer study group for weekly problem-solving sessions', createdBy: 'Alex J.' },
  { id: 'g4', name: 'PHYS101 Lab Team — Group 2', type: 'class',           memberCount: 5,  course: 'PHYS101',  description: 'Lab group for Quantum Mechanics experiments',          createdBy: 'Prof. Adams' },
  { id: 'g5', name: 'Robotics Club',              type: 'extracurricular', memberCount: 18, description: 'Student-led robotics and automation club',                       createdBy: 'Admin' },
];

export function GroupsPage() {
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (activeMembership?.role || user?.role || user?.roles?.[0] || 'student').toLowerCase();
  const canManage = ['teacher', 'assistant_teacher', 'org_admin', 'branch_admin', 'super_admin'].includes(userRole);

  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<Group['type'] | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<Group['type']>('class');
  const [newDesc, setNewDesc] = useState('');

  const filtered = groups.filter((g) => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || g.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const initials = (user?.firstName?.[0] || 'U') + (user?.lastName?.[0] || '');
    setGroups([{ id: `g${Date.now()}`, name: newName, type: newType, memberCount: 1, description: newDesc, createdBy: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'You' }, ...groups]);
    setNewName(''); setNewDesc(''); setShowModal(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Groups & Cohorts</h1>
          <p>Manage student classes, study groups, cohorts, and extracurricular clubs</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Group</button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div className="topbar-search" style={{ flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input placeholder="Search groups..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 'auto' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
          <option value="all">All Types</option>
          <option value="class">Classes</option>
          <option value="cohort">Cohorts</option>
          <option value="study">Study Groups</option>
          <option value="extracurricular">Extracurricular</option>
        </select>
      </div>

      {/* Group Cards */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <Users size={40} style={{ opacity: 0.3, marginBottom: 'var(--space-3)' }} />
          <p>No groups found. Try a different search or filter.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {filtered.map((g) => {
            const { label, color } = TYPE_CONFIG[g.type];
            return (
              <div key={g.id} className="card" style={{ borderTop: `3px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{g.name}</div>
                    {g.course && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>Course: {g.course}</div>}
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color, background: `${color}18`, borderRadius: 999, padding: '2px 8px' }}>{label}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>{g.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} style={{ color: 'var(--text-tertiary)' }} />
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{g.memberCount} members</span>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <button className="btn btn-secondary btn-sm">View</button>
                    {canManage && <button className="btn btn-ghost btn-icon" style={{ width: 30, height: 30 }}><Edit2 size={13} /></button>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontWeight: 600, fontSize: '1.125rem' }}>Create New Group</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Group Name</label>
                <input className="form-input" placeholder="e.g. CS301 — Section B" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-input" value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                  <option value="class">Class</option>
                  <option value="cohort">Cohort</option>
                  <option value="study">Study Group</option>
                  <option value="extracurricular">Extracurricular</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} placeholder="Brief description of this group's purpose..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Group</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
