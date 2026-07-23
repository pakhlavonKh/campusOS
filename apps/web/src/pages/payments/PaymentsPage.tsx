import { useState } from 'react';
import { CreditCard, Download, CheckCircle2, Clock, AlertTriangle, Plus, DollarSign, Receipt } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial';

interface Invoice {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: PaymentStatus;
  student?: string;
}

const STATUS_CONFIG: Record<PaymentStatus, { label: string; badge: string; icon: typeof CheckCircle2 }> = {
  paid:    { label: 'Paid',     badge: 'badge-success', icon: CheckCircle2 },
  pending: { label: 'Pending',  badge: 'badge-warning', icon: Clock },
  overdue: { label: 'Overdue',  badge: 'badge-danger',  icon: AlertTriangle },
  partial: { label: 'Partial',  badge: 'badge-info',    icon: Clock },
};

const MOCK_INVOICES: Invoice[] = [
  { id: 'INV-001', description: 'Tuition Fee — Semester 1, 2026',    amount: 4500, dueDate: '2026-02-01', paidDate: '2026-01-28', status: 'paid',    student: 'Alex Johnson' },
  { id: 'INV-002', description: 'Lab & Materials Fee — Semester 1',  amount:  350, dueDate: '2026-02-01', paidDate: '2026-01-28', status: 'paid',    student: 'Alex Johnson' },
  { id: 'INV-003', description: 'Tuition Fee — Semester 2, 2026',    amount: 4500, dueDate: '2026-07-01',                         status: 'overdue',  student: 'Alex Johnson' },
  { id: 'INV-004', description: 'Sports & Activities Contribution',   amount:  120, dueDate: '2026-08-01',                         status: 'pending',  student: 'Alex Johnson' },
  { id: 'INV-005', description: 'Library & Technology Fee',           amount:   80, dueDate: '2026-08-01',                         status: 'pending',  student: 'Alex Johnson' },
];

export function PaymentsPage() {
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (activeMembership?.role || user?.role || user?.roles?.[0] || 'parent').toLowerCase();
  const isAdmin = ['org_admin', 'branch_admin', 'super_admin'].includes(userRole);

  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');

  const filtered = invoices.filter((inv) => statusFilter === 'all' || inv.status === statusFilter);

  const totalOwed = invoices.filter((i) => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;

  const handlePayNow = (id: string) => {
    setInvoices((prev) => prev.map((inv) => inv.id === id ? { ...inv, status: 'paid', paidDate: new Date().toISOString().split('T')[0] } : inv));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Payments & Invoices</h1>
          <p>{isAdmin ? 'Manage tuition invoices, payment records, and financial summaries' : 'View and pay outstanding fees and invoices'}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary"><Download size={16} /> Export</button>
          {isAdmin && <button className="btn btn-primary"><Plus size={16} /> Issue Invoice</button>}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Total Paid</div>
              <div className="stat-value" style={{ color: 'var(--color-success-600)' }}>${totalPaid.toLocaleString()}</div>
              <div className="stat-change">This academic year</div>
            </div>
            <div className="stat-icon green"><CheckCircle2 size={20} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Amount Owed</div>
              <div className="stat-value" style={{ color: totalOwed > 0 ? 'var(--color-danger-600)' : 'var(--color-success-600)' }}>${totalOwed.toLocaleString()}</div>
              <div className="stat-change">Across {invoices.filter((i) => i.status !== 'paid').length} invoices</div>
            </div>
            <div className="stat-icon amber"><DollarSign size={20} /></div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Overdue Invoices</div>
              <div className="stat-value" style={{ color: overdueCount > 0 ? 'var(--color-danger-600)' : 'var(--color-success-600)' }}>{overdueCount}</div>
              <div className="stat-change">{overdueCount > 0 ? 'Immediate attention required' : 'No overdue items'}</div>
            </div>
            <div className="stat-icon" style={{ background: overdueCount > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)' }}>
              <AlertTriangle size={20} style={{ color: overdueCount > 0 ? 'var(--color-danger-600)' : 'var(--color-success-600)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Table */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
          <option value="all">All Invoices</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
        </select>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Description</th>
              {isAdmin && <th>Student</th>}
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => {
              const { badge, icon: Icon } = STATUS_CONFIG[inv.status];
              return (
                <tr key={inv.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{inv.id}</span></td>
                  <td style={{ fontWeight: 500 }}>{inv.description}</td>
                  {isAdmin && <td>{inv.student}</td>}
                  <td style={{ fontWeight: 600 }}>${inv.amount.toLocaleString()}</td>
                  <td style={{ color: inv.status === 'overdue' ? 'var(--color-danger-600)' : 'var(--text-secondary)' }}>{inv.dueDate}</td>
                  <td>
                    <span className={`badge ${badge}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon size={11} /> {STATUS_CONFIG[inv.status].label}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn-ghost btn-sm"><Receipt size={14} /> View</button>
                      {inv.status !== 'paid' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handlePayNow(inv.id)}>
                          <CreditCard size={14} /> Pay Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
