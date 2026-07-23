import { useState } from 'react';
import { Phone, Mail, Plus, Search, Tag, TrendingUp, Calendar, User, X, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'enrolled' | 'lost';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'website' | 'referral' | 'social' | 'event' | 'organic';
  status: LeadStatus;
  program: string;
  createdAt: string;
  lastContact?: string;
  notes?: string;
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; badge: string; color: string }> = {
  new:       { label: 'New',       badge: 'badge-info',    color: '#3b82f6' },
  contacted: { label: 'Contacted', badge: 'badge-warning', color: '#f59e0b' },
  qualified: { label: 'Qualified', badge: 'badge-purple',  color: '#8b5cf6' },
  enrolled:  { label: 'Enrolled',  badge: 'badge-success', color: '#10b981' },
  lost:      { label: 'Lost',      badge: 'badge-danger',  color: '#ef4444' },
};

const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Jamie Rivera',   email: 'jamie.r@email.com',  phone: '+1 555-0101', source: 'website',  status: 'qualified', program: 'Computer Science',      createdAt: '2026-07-01', lastContact: '2026-07-20' },
  { id: 'l2', name: 'Priya Sharma',   email: 'priya.s@email.com',  phone: '+1 555-0202', source: 'referral', status: 'contacted', program: 'Data Analytics',         createdAt: '2026-07-05', lastContact: '2026-07-18' },
  { id: 'l3', name: 'Marcus Webb',    email: 'marcus.w@email.com', phone: '+1 555-0303', source: 'event',    status: 'new',       program: 'Engineering Management', createdAt: '2026-07-10' },
  { id: 'l4', name: 'Sofia Chen',     email: 'sofia.c@email.com',  phone: '+1 555-0404', source: 'social',   status: 'enrolled',  program: 'Computer Science',       createdAt: '2026-06-15', lastContact: '2026-07-15' },
  { id: 'l5', name: 'Aiden Okafor',   email: 'aiden.o@email.com',  phone: '+1 555-0505', source: 'organic',  status: 'lost',      program: 'Physics',                createdAt: '2026-06-20', lastContact: '2026-07-01', notes: 'Chose a competitor program.' },
  { id: 'l6', name: 'Maya Patel',     email: 'maya.p@email.com',   phone: '+1 555-0606', source: 'website',  status: 'new',       program: 'Mathematics',            createdAt: '2026-07-20' },
];

const PIPELINE_ORDER: LeadStatus[] = ['new', 'contacted', 'qualified', 'enrolled', 'lost'];

export function CRMPage() {
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (activeMembership?.role || user?.role || user?.roles?.[0] || 'org_admin').toLowerCase();

  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProgram, setNewProgram] = useState('');

  const filtered = leads.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.email.toLowerCase().includes(search.toLowerCase()) ||
    l.program.toLowerCase().includes(search.toLowerCase())
  );

  const advanceLead = (id: string) => {
    setLeads((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const idx = PIPELINE_ORDER.indexOf(l.status);
      const next = PIPELINE_ORDER[Math.min(idx + 1, PIPELINE_ORDER.length - 2)]; // don't auto-advance to 'lost'
      return { ...l, status: next, lastContact: new Date().toISOString().split('T')[0] };
    }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setLeads([{ id: `l${Date.now()}`, name: newName, email: newEmail, phone: newPhone, source: 'website', status: 'new', program: newProgram, createdAt: new Date().toISOString().split('T')[0] }, ...leads]);
    setNewName(''); setNewEmail(''); setNewPhone(''); setNewProgram(''); setShowModal(false);
  };

  // Counts for the pipeline overview bar
  const counts = PIPELINE_ORDER.reduce((acc, s) => { acc[s] = leads.filter((l) => l.status === s).length; return acc; }, {} as Record<LeadStatus, number>);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>CRM — Lead Pipeline</h1>
          <p>Track prospective student inquiries from first contact through enrollment</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 2 }}>
            {(['kanban', 'table'] as const).map((v) => (
              <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView(v)} style={{ textTransform: 'capitalize' }}>{v}</button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add Lead</button>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        {PIPELINE_ORDER.map((s) => (
          <div key={s} style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-secondary)', border: `1px solid ${STATUS_CONFIG[s].color}33`, borderRadius: 'var(--radius-md)', textAlign: 'center', minWidth: 90 }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: STATUS_CONFIG[s].color }}>{counts[s]}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{STATUS_CONFIG[s].label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="topbar-search" style={{ maxWidth: 360, marginBottom: 'var(--space-5)' }}>
        <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
        <input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Kanban or Table View */}
      {view === 'kanban' ? (
        <div style={{ display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', paddingBottom: 'var(--space-4)' }}>
          {PIPELINE_ORDER.map((status) => {
            const col = filtered.filter((l) => l.status === status);
            const { label, color } = STATUS_CONFIG[status];
            return (
              <div key={status} style={{ minWidth: 240, flex: '0 0 240px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color }}>{label}</span>
                  <span style={{ fontSize: '0.75rem', background: `${color}22`, color, borderRadius: 999, padding: '2px 8px', fontWeight: 700 }}>{col.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {col.map((l) => (
                    <div key={l.id} className="card" style={{ padding: 'var(--space-3)', cursor: 'default' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 4 }}>{l.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{l.program}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>{l.email}</div>
                      {status !== 'enrolled' && status !== 'lost' && (
                        <button className="btn btn-primary btn-sm" style={{ width: '100%', fontSize: '0.75rem' }} onClick={() => advanceLead(l.id)}>
                          → Advance
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Program</th><th>Source</th><th>Status</th><th>Last Contact</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.name}</td>
                  <td style={{ fontSize: '0.875rem' }}>{l.email}</td>
                  <td>{l.program}</td>
                  <td><span className="badge badge-info" style={{ fontSize: '0.6875rem', textTransform: 'capitalize' }}>{l.source}</span></td>
                  <td><span className={`badge ${STATUS_CONFIG[l.status].badge}`}>{STATUS_CONFIG[l.status].label}</span></td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{l.lastContact || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {l.status !== 'enrolled' && l.status !== 'lost' && (
                      <button className="btn btn-primary btn-sm" onClick={() => advanceLead(l.id)}>Advance</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontWeight: 600, fontSize: '1.125rem' }}>Add New Lead</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={newName} onChange={(e) => setNewName(e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Interested Program</label><input className="form-input" placeholder="e.g. Computer Science" value={newProgram} onChange={(e) => setNewProgram(e.target.value)} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
