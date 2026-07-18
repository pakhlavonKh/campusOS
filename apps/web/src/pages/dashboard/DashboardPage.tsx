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

const stats = [
  {
    title: 'Total Students',
    value: '2,847',
    change: '+12.5%',
    trend: 'positive' as const,
    icon: Users,
    iconColor: 'purple',
  },
  {
    title: 'Active Courses',
    value: '164',
    change: '+3.2%',
    trend: 'positive' as const,
    icon: BookOpen,
    iconColor: 'green',
  },
  {
    title: 'Today\'s Attendance',
    value: '94.2%',
    change: '+1.8%',
    trend: 'positive' as const,
    icon: ClipboardCheck,
    iconColor: 'amber',
  },
  {
    title: 'Avg. Grade',
    value: 'B+',
    change: '-0.3%',
    trend: 'negative' as const,
    icon: TrendingUp,
    iconColor: 'red',
  },
];

const recentActivities = [
  { user: 'Sarah Johnson', action: 'submitted homework', target: 'Physics Lab Report', time: '5 min ago', avatar: 'SJ' },
  { user: 'Michael Chen', action: 'enrolled in', target: 'Advanced Mathematics', time: '12 min ago', avatar: 'MC' },
  { user: 'Emma Wilson', action: 'graded', target: '15 quiz attempts', time: '25 min ago', avatar: 'EW' },
  { user: 'James Park', action: 'created course', target: 'Introduction to Biology', time: '1 hr ago', avatar: 'JP' },
  { user: 'Lisa Anderson', action: 'recorded attendance for', target: 'English Literature B', time: '2 hr ago', avatar: 'LA' },
];

const upcomingSchedule = [
  { title: 'Physics 101 — Lecture', time: '09:00 — 10:30', room: 'Room 204', status: 'In Progress' },
  { title: 'Math Workshop', time: '11:00 — 12:00', room: 'Lab 3', status: 'Upcoming' },
  { title: 'Staff Meeting', time: '14:00 — 15:00', room: 'Conference A', status: 'Upcoming' },
  { title: 'Chemistry Lab', time: '15:30 — 17:00', room: 'Lab 1', status: 'Upcoming' },
];

import { useTranslation } from '../../providers/LanguageProvider';

export function DashboardPage() {
  const { language, t } = useTranslation();

  const greeting = language === 'uz' ? 'Xayrli kun, Admin 👋' : language === 'ru' ? 'Добрый день, Администратор 👋' : 'Good afternoon, Admin 👋';
  const desc = language === 'uz' ? "Bugun kampusingizda sodir bo'layotgan voqealar." : language === 'ru' ? 'Вот что происходит в вашем кампусе сегодня.' : "Here's what's happening at your campus today.";
  const todayLabel = language === 'uz' ? 'Bugun' : language === 'ru' ? 'Сегодня' : 'Today';
  const viewReportsLabel = language === 'uz' ? 'Hisobotlar' : language === 'ru' ? 'Отчеты' : 'View Reports';
  const fromLastMonthLabel = language === 'uz' ? "o'tgan oydan beri" : language === 'ru' ? 'с прошлого месяца' : 'from last month';
  const viewAllLabel = language === 'uz' ? "Hammasini ko'rish" : language === 'ru' ? 'Показать все' : 'View All';
  const fullCalendarLabel = language === 'uz' ? "To'liq kalendar" : language === 'ru' ? 'Весь календарь' : 'Full Calendar';

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
            {recentActivities.map((activity, i) => (
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
            ))}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem' }}>{t('upcomingSchedule')}</h3>
            <button className="btn btn-ghost btn-sm">{fullCalendarLabel}</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {upcomingSchedule.map((item, i) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
