import { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  ClipboardCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Calendar,
  Clock,
} from 'lucide-react';
import { useTranslation } from '../../providers/LanguageProvider';
import { useAuthStore } from '../../store/auth.store';
import { apiClient } from '../../api/client';

export function DashboardPage() {
  const { language, t } = useTranslation();
  const user = useAuthStore((state: any) => state.user);
  
  const [coursesCount, setCoursesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities] = useState<any[]>([]);
  const [upcomingSchedule] = useState<any[]>([]);

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
        console.error('Failed to load courses count', err);
        setCoursesCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'User';

  const greeting = language === 'uz' 
    ? `Xayrli kun, ${displayName} 👋` 
    : language === 'ru' 
      ? `Добрый день, ${displayName} 👋` 
      : `Good afternoon, ${displayName} 👋`;

  const desc = language === 'uz' ? "Bugun kampusingizda sodir bo'layotgan voqealar." : language === 'ru' ? 'Вот что происходит в вашем кампусе сегодня.' : "Here's what's happening at your campus today.";
  const todayLabel = language === 'uz' ? 'Bugun' : language === 'ru' ? 'Сегодня' : 'Today';
  const viewReportsLabel = language === 'uz' ? 'Hisobotlar' : language === 'ru' ? 'Отчеты' : 'View Reports';
  const fromLastMonthLabel = language === 'uz' ? "o'tgan oydan beri" : language === 'ru' ? 'с прошлого месяца' : 'from last month';
  const viewAllLabel = language === 'uz' ? "Hammasini ko'rish" : language === 'ru' ? 'Показать все' : 'View All';
  const fullCalendarLabel = language === 'uz' ? "To'liq kalendar" : language === 'ru' ? 'Весь календарь' : 'Full Calendar';

  const stats = [
    {
      title: 'Total Students',
      value: '0',
      change: '0%',
      trend: 'positive' as const,
      icon: Users,
      iconColor: 'purple',
    },
    {
      title: 'Active Courses',
      value: loading ? '...' : (coursesCount !== null ? String(coursesCount) : '0'),
      change: '0%',
      trend: 'positive' as const,
      icon: BookOpen,
      iconColor: 'green',
    },
    {
      title: 'Today\'s Attendance',
      value: '0%',
      change: '0%',
      trend: 'positive' as const,
      icon: ClipboardCheck,
      iconColor: 'amber',
    },
    {
      title: 'Avg. Grade',
      value: 'N/A',
      change: '0%',
      trend: 'negative' as const,
      icon: TrendingUp,
      iconColor: 'red',
    },
  ];

  const getTranslatedTitle = (title: string) => {
    if (title === 'Total Students') return t('totalStudents');
    if (title === 'Active Courses') return t('activeCourses');
    if (title === 'Today\'s Attendance') return t('todaysAttendance');
    if (title === 'Avg. Grade') return t('avgGrade');
    return title;
  };

  return (
    <div className="animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>{greeting}</h1>
          <p>{desc}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary">
            <Calendar size={16} />
            {todayLabel}
          </button>
          <button className="btn btn-primary">
            <Activity size={16} />
            {viewReportsLabel}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card animate-fade-in">
              <div className="card-header">
                <span className="card-title">{getTranslatedTitle(stat.title)}</span>
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
                {stat.change} {fromLastMonthLabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column content */}
      <div className="content-grid">
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem' }}>{t('recentActivity')}</h3>
            <button className="btn btn-ghost btn-sm">{viewAllLabel}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {recentActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                {t('noRecentActivity') || 'No recent activity'}
              </div>
            ) : (
              recentActivities.map((activity, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-2) 0',
                    borderBottom: i < recentActivities.length - 1
                      ? '1px solid var(--border-subtle)' : 'none',
                  }}
                >
                  <div className="avatar avatar-sm">{activity.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem' }}>
                      <strong>{activity.user}</strong>{' '}
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {activity.action}
                      </span>{' '}
                      <span style={{ color: 'var(--text-accent)' }}>
                        {activity.target}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {activity.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem' }}>{t('upcomingSchedule')}</h3>
            <button className="btn btn-ghost btn-sm">{fullCalendarLabel}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {upcomingSchedule.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                {t('noUpcomingSchedule') || 'No upcoming schedule'}
              </div>
            ) : (
              upcomingSchedule.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-3)',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      width: '3px',
                      height: '40px',
                      borderRadius: '2px',
                      background:
                        item.status === 'In Progress'
                          ? 'var(--color-accent-500)'
                          : 'var(--color-primary-500)',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px' }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        fontSize: '0.75rem',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {item.time}
                      </span>
                      <span>{item.room}</span>
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      item.status === 'In Progress' ? 'badge-success' : 'badge-info'
                    }`}
                  >
                    {item.status === 'In Progress' ? t('inProgress') : t('upcoming')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
