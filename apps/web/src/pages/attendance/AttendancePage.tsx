import { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface AttendanceRow {
  id: string;
  student: string;
  avatar: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

const mockAttendance: AttendanceRow[] = [
  { id: '1', student: 'Alice Thompson', avatar: 'AT', status: 'present' },
  { id: '2', student: 'Benjamin Cruz', avatar: 'BC', status: 'present' },
  { id: '3', student: 'Chloe Park', avatar: 'CP', status: 'late' },
  { id: '4', student: 'Daniel Williams', avatar: 'DW', status: 'present' },
  { id: '5', student: 'Emma Rodriguez', avatar: 'ER', status: 'absent' },
  { id: '6', student: 'Frank Nakamura', avatar: 'FN', status: 'present' },
  { id: '7', student: 'Grace Kim', avatar: 'GK', status: 'excused' },
  { id: '8', student: 'Henry Okafor', avatar: 'HO', status: 'present' },
  { id: '9', student: 'Isla Fernandez', avatar: 'IF', status: 'present' },
  { id: '10', student: 'Jason Patel', avatar: 'JP', status: 'late' },
];

const statusColors: Record<string, string> = {
  present: 'badge-success',
  absent: 'badge-danger',
  late: 'badge-warning',
  excused: 'badge-info',
};

const statusIcons: Record<string, typeof Check> = {
  present: Check,
  absent: X,
  late: Clock,
  excused: AlertTriangle,
};

export function AttendancePage() {
  const [records, setRecords] = useState(mockAttendance);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const summary = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    excused: records.filter((r) => r.status === 'excused').length,
  };

  const toggleStatus = (id: string) => {
    const order: AttendanceRow['status'][] = ['present', 'absent', 'late', 'excused'];
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const currentIndex = order.indexOf(r.status);
        const nextStatus = order[(currentIndex + 1) % order.length];
        return { ...r, status: nextStatus };
      }),
    );
  };

  const rate = records.length > 0
    ? Math.round((summary.present / records.length) * 100)
    : 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Attendance</h1>
          <p>Track and manage student attendance records</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary">
            <Download size={16} />
            Export
          </button>
          <button className="btn btn-primary">
            <Check size={16} />
            Save Records
          </button>
        </div>
      </div>

      {/* Date Navigator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <button className="btn btn-ghost btn-icon">
          <ChevronLeft size={18} />
        </button>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            fontSize: '0.9375rem',
            fontWeight: 600,
          }}
        >
          <Calendar size={18} style={{ color: 'var(--color-primary-400)' }} />
          {today}
        </div>
        <button className="btn btn-ghost btn-icon">
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="card animate-fade-in">
          <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>Present</div>
          <div className="card-value" style={{ color: 'var(--color-accent-400)' }}>{summary.present}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{rate}% rate</div>
        </div>
        <div className="card animate-fade-in">
          <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>Absent</div>
          <div className="card-value" style={{ color: 'var(--color-danger-400)' }}>{summary.absent}</div>
        </div>
        <div className="card animate-fade-in">
          <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>Late</div>
          <div className="card-value" style={{ color: 'var(--color-warning-400)' }}>{summary.late}</div>
        </div>
        <div className="card animate-fade-in">
          <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>Excused</div>
          <div className="card-value" style={{ color: 'var(--color-primary-400)' }}>{summary.excused}</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                const StatusIcon = statusIcons[record.status];
                return (
                  <tr key={record.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div className="avatar avatar-sm">{record.avatar}</div>
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {record.student}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[record.status]}`}>
                        <StatusIcon size={12} style={{ marginRight: '4px' }} />
                        {record.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => toggleStatus(record.id)}
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
