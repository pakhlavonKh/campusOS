import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, BookOpen, ClipboardCheck, GraduationCap, Download } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface MetricCard {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'flat';
  icon: typeof BarChart3;
  color: string;
}

const METRICS: MetricCard[] = [
  { label: 'Total Students',        value: '1,284',  change: '+42 this semester',    trend: 'up',   icon: Users,         color: 'purple' },
  { label: 'Course Completion Rate',value: '78.4%',  change: '+3.2% vs last semester', trend: 'up', icon: BookOpen,      color: 'green' },
  { label: 'Avg. Attendance Rate',  value: '91.2%',  change: '-0.8% vs last month',  trend: 'down', icon: ClipboardCheck,color: 'amber' },
  { label: 'Avg. Grade (GPA)',       value: '3.42',   change: '+0.08 improvement',    trend: 'up',   icon: GraduationCap, color: 'info' },
];

const TOP_COURSES = [
  { name: 'Data Structures (CS301)',        enrolled: 145, completion: 82, avgGrade: 'B+' },
  { name: 'Quantum Mechanics (PHYS101)',    enrolled: 88,  completion: 71, avgGrade: 'B'  },
  { name: 'Calculus II (MATH202)',          enrolled: 212, completion: 76, avgGrade: 'B-' },
  { name: 'Technical Writing (ENG120)',     enrolled: 167, completion: 89, avgGrade: 'A-' },
  { name: 'Systems Programming (CS412)',    enrolled: 54,  completion: 68, avgGrade: 'B+' },
];

const BRANCH_DATA = [
  { branch: 'Main Campus',  students: 642, teachers: 48, attendance: 93 },
  { branch: 'North Branch', students: 381, teachers: 29, attendance: 89 },
  { branch: 'Online',       students: 261, teachers: 15, attendance: 91 },
];

export function AnalyticsPage() {
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (activeMembership?.role || user?.role || user?.roles?.[0] || 'org_admin').toLowerCase();

  const [period, setPeriod] = useState<'week' | 'month' | 'semester' | 'year'>('semester');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Reporting & Analytics</h1>
          <p>Organization-wide performance metrics, enrollment trends, and academic outcomes</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 2 }}>
            {(['week', 'month', 'semester', 'year'] as const).map((p) => (
              <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod(p)} style={{ textTransform: 'capitalize' }}>{p}</button>
            ))}
          </div>
          <button className="btn btn-secondary"><Download size={16} /> Export Report</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid" style={{ marginBottom: 'var(--space-8)' }}>
        {METRICS.map((m) => {
          const Icon = m.icon;
          const TrendIcon = m.trend === 'up' ? TrendingUp : m.trend === 'down' ? TrendingDown : BarChart3;
          return (
            <div key={m.label} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="stat-label">{m.label}</div>
                  <div className="stat-value">{m.value}</div>
                  <div className="stat-change" style={{ display: 'flex', alignItems: 'center', gap: 4, color: m.trend === 'up' ? 'var(--color-success-600)' : m.trend === 'down' ? 'var(--color-danger-600)' : 'var(--text-tertiary)' }}>
                    <TrendIcon size={12} /> {m.change}
                  </div>
                </div>
                <div className={`stat-icon ${m.color}`}><Icon size={20} /></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="content-grid">
        {/* Top Courses Table */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header">
            <h3 style={{ fontWeight: 600 }}>Course Performance</h3>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Completion & grade data for current semester</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Enrolled</th>
                  <th>Completion Rate</th>
                  <th>Avg. Grade</th>
                </tr>
              </thead>
              <tbody>
                {TOP_COURSES.map((c) => (
                  <tr key={c.name}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.enrolled}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                          <div style={{ width: `${c.completion}%`, height: '100%', background: c.completion >= 80 ? 'var(--color-success-500)' : c.completion >= 70 ? 'var(--color-warning-500)' : 'var(--color-danger-500)', borderRadius: 99, transition: 'width 0.4s' }} />
                        </div>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, minWidth: 36 }}>{c.completion}%</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{c.avgGrade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Branch breakdown */}
        <div className="card">
          <div className="card-header"><h3 style={{ fontWeight: 600 }}>By Branch</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {BRANCH_DATA.map((b) => (
              <div key={b.branch} style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{b.branch}</span>
                  <span className={`badge ${b.attendance >= 92 ? 'badge-success' : b.attendance >= 88 ? 'badge-warning' : 'badge-danger'}`}>{b.attendance}% attendance</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Students</div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{b.students}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Faculty</div>
                    <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{b.teachers}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Enrollment Trend (simulated bars) */}
        <div className="card">
          <div className="card-header"><h3 style={{ fontWeight: 600 }}>Enrollment Trend</h3></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-2)', height: 140, paddingBottom: 'var(--space-3)' }}>
            {[820, 940, 1050, 1120, 1200, 1284].map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>{val}</span>
                <div style={{ width: '100%', height: `${(val / 1284) * 110}px`, background: i === 5 ? 'var(--color-primary-500)' : 'var(--color-primary-400)', borderRadius: 'var(--radius-sm)', opacity: 0.6 + i * 0.08, transition: 'height 0.4s' }} />
                <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>S{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
