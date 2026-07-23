import { useState, useEffect } from 'react';
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
import { attendanceService, AttendanceRecord } from '../../api/services/attendance.service';
import { useAuthStore } from '../../store/auth.store';

interface AttendanceRow {
  id: string;
  student: string;
  avatar: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

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
  const user = useAuthStore((state: any) => state.user);
  const userRole = (user?.role || user?.roles?.[0] || 'student').toLowerCase();
  const isStudent = userRole === 'student';

  const [records, setRecords] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      try {
        const statsRes = await attendanceService.getDailyStats(selectedDate);
        if (statsRes.success && (statsRes.data as any)?.records) {
          const rawRecords = (statsRes.data as any).records;
          if (isStudent && user) {
            const displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
            setRecords(rawRecords.filter((r: AttendanceRow) => r.id === user.id || r.student.toLowerCase().includes(displayName.toLowerCase())));
          } else {
            setRecords(rawRecords);
          }
        } else {
          setRecords([]);
        }
      } catch (err) {
        console.warn('Backend attendance endpoint returned empty or unseeded data.', err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [selectedDate, isStudent, user]);

  const summary = {
    present: records.filter((r) => r.status === 'present').length,
    absent: records.filter((r) => r.status === 'absent').length,
    late: records.filter((r) => r.status === 'late').length,
    excused: records.filter((r) => r.status === 'excused').length,
  };

  const handleStatusChange = async (id: string, newStatus: AttendanceRow['status']) => {
    if (isStudent) return; // Students cannot edit attendance
    const target = records.find((r) => r.id === id);
    if (!target) return;

    try {
      await attendanceService.recordAttendance({
        studentId: id,
        date: selectedDate,
        status: newStatus,
      });
    } catch (err) {
      console.warn('Record attendance backend call error.', err);
    }

    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{isStudent ? 'My Attendance' : 'Attendance Tracking'}</h1>
          <p>{isStudent ? 'Your personal course attendance summary and status' : 'Daily student attendance roster and summary reports'}</p>
        </div>
        {!isStudent && (
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-secondary">
              <Download size={16} /> Export Report
            </button>
          </div>
        )}
      </div>

      {/* Date Navigator */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4) var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Calendar size={20} style={{ color: 'var(--color-primary-500)' }} />
          <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{selectedDate}</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto' }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Daily Summary Cards */}
      <div className="stat-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card">
          <div className="stat-label">Present</div>
          <div className="stat-value" style={{ color: 'var(--color-success-600)' }}>
            {summary.present}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Absent</div>
          <div className="stat-value" style={{ color: 'var(--color-danger-600)' }}>
            {summary.absent}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Late</div>
          <div className="stat-value" style={{ color: 'var(--color-warning-600)' }}>
            {summary.late}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Excused</div>
          <div className="stat-value" style={{ color: 'var(--color-info-600)' }}>
            {summary.excused}
          </div>
        </div>
      </div>

      {/* Roster Table */}
      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Fetching attendance records from backend...
        </div>
      ) : records.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <Calendar size={36} style={{ marginBottom: 'var(--space-3)', opacity: 0.5 }} />
          <p>{isStudent ? `No attendance entries recorded for you on ${selectedDate}.` : `No attendance entries found for ${selectedDate}. Select a date or mark initial attendance.`}</p>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>{isStudent ? 'Course / Roster' : 'Student'}</th>
                <th>Status</th>
                {!isStudent && <th style={{ textAlign: 'right' }}>Quick Actions</th>}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => {
                const IconComponent = statusIcons[r.status] || Check;
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8125rem' }}>
                          {r.avatar}
                        </div>
                        <span style={{ fontWeight: 500 }}>{r.student}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusColors[r.status]}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <IconComponent size={12} />
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    {!isStudent && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 'var(--space-1)' }}>
                          {(['present', 'late', 'absent', 'excused'] as const).map((s) => (
                            <button
                              key={s}
                              className={`btn btn-sm ${r.status === s ? 'btn-primary' : 'btn-ghost'}`}
                              onClick={() => handleStatusChange(r.id, s)}
                              style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
