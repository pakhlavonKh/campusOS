import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  Building2,
  GraduationCap,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { useTranslation } from '../../providers/LanguageProvider';
import { useAuthStore } from '../../store/auth.store';
import { apiClient } from '../../api/client';

export function DashboardPage() {
  const { language } = useTranslation();
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const navigate = useNavigate();
  
  const [coursesCount, setCoursesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // SRS §5.30: role resolved from active membership context; fallback to flat role.
  const userRole = (
    activeMembership?.role ||
    user?.role ||
    user?.roles?.[0] ||
    'student'
  ).toLowerCase();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await apiClient<{ success: boolean; data: any[] }>('/courses', { requireAuth: true });
        if (response && response.success && Array.isArray(response.data)) {
          setCoursesCount(response.data.length);
        } else {
          setCoursesCount(0);
        }
      } catch (err) {
        console.warn('Failed to load courses count', err);
        setCoursesCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'User';

  const getGreeting = () => {
    const roleTitle = userRole === 'super_admin' ? ' (Super Admin)' : userRole === 'teacher' ? ' (Faculty)' : userRole === 'parent' ? ' (Parent Portal)' : '';
    if (language === 'uz') return `Xayrli kun, ${displayName}${roleTitle} 👋`;
    if (language === 'ru') return `Добрый день, ${displayName}${roleTitle} 👋`;
    return `Welcome back, ${displayName}${roleTitle} 👋`;
  };

  const desc = language === 'uz' ? "Bugun kampusingizda sodir bo'layotgan voqealar." : language === 'ru' ? 'Вот что происходит в вашем кампусе сегодня.' : "Here's your personal overview and metrics.";

  // Role-customized stat cards
  const getRoleStats = () => {
    if (userRole === 'super_admin' || userRole === 'org_admin' || userRole === 'branch_admin') {
      return [
        {
          title: 'Registered Organizations',
          value: '42',
          change: '+3 this month',
          trend: 'positive' as const,
          icon: Building2,
          iconColor: 'purple',
        },
        {
          title: 'Active System Users',
          value: '18,245',
          change: '+1,200 this month',
          trend: 'positive' as const,
          icon: Users,
          iconColor: 'green',
        },
        {
          title: 'Total Active Courses',
          value: loading ? '...' : (coursesCount !== null ? String(coursesCount) : '0'),
          change: '+5%',
          trend: 'positive' as const,
          icon: BookOpen,
          iconColor: 'amber',
        },
        {
          title: 'System Health',
          value: '99.99%',
          change: 'Operational',
          trend: 'positive' as const,
          icon: Activity,
          iconColor: 'info',
        },
      ];
    } else if (userRole === 'teacher' || userRole === 'assistant_teacher') {
      return [
        {
          title: 'Active Classes Taught',
          value: loading ? '...' : (coursesCount !== null ? String(coursesCount) : '4'),
          change: 'Spring Semester',
          trend: 'positive' as const,
          icon: BookOpen,
          iconColor: 'purple',
        },
        {
          title: 'Enrolled Students',
          value: '142',
          change: '4 courses',
          trend: 'positive' as const,
          icon: Users,
          iconColor: 'green',
        },
        {
          title: "Today's Attendance",
          value: '94%',
          change: '+2%',
          trend: 'positive' as const,
          icon: ClipboardCheck,
          iconColor: 'amber',
        },
        {
          title: 'Submissions To Grade',
          value: '18',
          change: 'Pending review',
          trend: 'negative' as const,
          icon: GraduationCap,
          iconColor: 'red',
        },
      ];
    } else if (userRole === 'parent') {
      return [
        {
          title: 'Linked Children',
          value: '1',
          change: 'Student Account',
          trend: 'positive' as const,
          icon: Users,
          iconColor: 'purple',
        },
        {
          title: "Child's Attendance",
          value: '98%',
          change: 'Last 30 Days',
          trend: 'positive' as const,
          icon: ClipboardCheck,
          iconColor: 'green',
        },
        {
          title: 'Latest Term GPA',
          value: '3.85 / 4.0',
          change: 'Honor Roll',
          trend: 'positive' as const,
          icon: TrendingUp,
          iconColor: 'amber',
        },
        {
          title: 'Unread Messages',
          value: '2',
          change: 'From Faculty',
          trend: 'positive' as const,
          icon: MessageSquare,
          iconColor: 'info',
        },
      ];
    } else {
      // Default: Student
      return [
        {
          title: 'Enrolled Courses',
          value: loading ? '...' : (coursesCount !== null ? String(coursesCount) : '5'),
          change: 'Active Term',
          trend: 'positive' as const,
          icon: BookOpen,
          iconColor: 'purple',
        },
        {
          title: 'Cumulative GPA',
          value: '3.78',
          change: '+0.12',
          trend: 'positive' as const,
          icon: TrendingUp,
          iconColor: 'green',
        },
        {
          title: 'Attendance Rate',
          value: '96%',
          change: 'Good standing',
          trend: 'positive' as const,
          icon: ClipboardCheck,
          iconColor: 'amber',
        },
        {
          title: 'Assignments Due',
          value: '3',
          change: 'This week',
          trend: 'negative' as const,
          icon: Clock,
          iconColor: 'red',
        },
      ];
    }
  };

  const stats = getRoleStats() || [];

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>{getGreeting()}</h1>
          <p>{desc}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {userRole === 'super_admin' && (
            <button className="btn btn-primary" onClick={() => navigate('/organizations')}>
              <Building2 size={16} /> Manage Organizations
            </button>
          )}
          {userRole === 'teacher' && (
            <button className="btn btn-primary" onClick={() => navigate('/gradebook')}>
              <Plus size={16} /> Create Assignment
            </button>
          )}
          {userRole === 'student' && (
            <button className="btn btn-primary" onClick={() => navigate('/courses')}>
              <BookOpen size={16} /> View My Courses
            </button>
          )}
          {userRole === 'parent' && (
            <button className="btn btn-primary" onClick={() => navigate('/attendance')}>
              <ClipboardCheck size={16} /> View Attendance
            </button>
          )}
        </div>
      </div>

      {/* Role Stats Grid */}
      <div className="stat-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card animate-fade-in">
              <div className="card-header">
                <span className="card-title">{stat.title}</span>
                <div className={`stat-icon ${stat.iconColor}`}>
                  <Icon size={22} />
                </div>
              </div>
              <div className="card-value">{stat.value}</div>
              <div className={`card-change ${stat.trend}`}>
                {stat.trend === 'positive' ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {stat.change}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column Content Section */}
      {userRole !== 'parent' && (
        <div className="content-grid" style={{ marginTop: 'var(--space-6)' }}>
          {/* Role-tailored Panel 1 */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                {userRole === 'teacher'
                  ? 'Upcoming Classes & Schedule'
                  : userRole === 'super_admin'
                  ? 'System Platform Activity'
                  : 'My Upcoming Deadlines'}
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {userRole === 'teacher' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>CS301 Data Structures</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Lecture Hall B • 45 Enrolled</div>
                    </div>
                    <span className="badge badge-info">10:00 AM Today</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>PHYS101 General Physics</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Science Lab 3 • 32 Enrolled</div>
                    </div>
                    <span className="badge badge-purple">02:30 PM Today</span>
                  </div>
                </>
              ) : userRole === 'super_admin' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Tenant Springfield University Registered</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Enterprise Billing Plan</div>
                    </div>
                    <span className="badge badge-purple">Just Now</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Database RLS Migration Executed</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Multi-tenant security policies active</div>
                    </div>
                    <span className="badge badge-success">Success</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Problem Set 4: Binary Search Trees</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>CS301 Data Structures</div>
                    </div>
                    <span className="badge badge-warning">Due in 2 days</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>Quantum Entanglement Lab Report</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>PHYS101 General Physics</div>
                    </div>
                    <span className="badge badge-info">Due in 5 days</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Role-tailored Panel 2 */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Quick Actions & Navigation</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/courses')} style={{ padding: 'var(--space-4)', justifyContent: 'center' }}>
                <BookOpen size={20} /> Courses
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/attendance')} style={{ padding: 'var(--space-4)', justifyContent: 'center' }}>
                <ClipboardCheck size={20} /> Attendance
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/gradebook')} style={{ padding: 'var(--space-4)', justifyContent: 'center' }}>
                <GraduationCap size={20} /> Gradebook
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/messaging')} style={{ padding: 'var(--space-4)', justifyContent: 'center' }}>
                <MessageSquare size={20} /> Messaging
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
