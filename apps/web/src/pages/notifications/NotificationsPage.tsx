import { useState } from 'react';
import { Bell, Check, BookOpen, GraduationCap, ClipboardCheck, MessageSquare, Settings, Trash2, Filter } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

type NotifType = 'grade' | 'homework' | 'attendance' | 'message' | 'system' | 'announcement';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  course?: string;
}

const TYPE_ICON: Record<NotifType, typeof Bell> = {
  grade:        GraduationCap,
  homework:     BookOpen,
  attendance:   ClipboardCheck,
  message:      MessageSquare,
  system:       Settings,
  announcement: Bell,
};

const TYPE_COLOR: Record<NotifType, string> = {
  grade:        '#6366f1',
  homework:     '#f59e0b',
  attendance:   '#10b981',
  message:      '#3b82f6',
  system:       '#8b5cf6',
  announcement: '#ec4899',
};

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'grade',        title: 'New Grade Posted',           body: 'Your midterm exam for CS301 has been graded: 92/100 (A)',               timestamp: '2 min ago',  read: false, course: 'CS301' },
  { id: '2', type: 'homework',     title: 'Assignment Due Tomorrow',    body: 'Problem Set 4: Binary Search Trees is due in 24 hours.',               timestamp: '1 hr ago',   read: false, course: 'CS301' },
  { id: '3', type: 'message',      title: 'New Message from Dr. Smith', body: 'Hi, please review the updated syllabus for PHYS101 attached.',         timestamp: '3 hr ago',   read: false },
  { id: '4', type: 'attendance',   title: 'Attendance Recorded',        body: 'Your attendance for PHYS101 on Monday was marked as Present.',         timestamp: '5 hr ago',   read: true,  course: 'PHYS101' },
  { id: '5', type: 'announcement', title: 'Campus Notice',              body: 'Library extended hours this week: 7:00 AM – 11:00 PM.',                timestamp: '1 day ago',  read: true },
  { id: '6', type: 'grade',        title: 'Lab Report Graded',          body: 'Your Quantum Entanglement lab report received 88/100 (B+).',           timestamp: '2 days ago', read: true,  course: 'PHYS101' },
  { id: '7', type: 'system',       title: 'System Maintenance',         body: 'Scheduled maintenance on Sunday 2:00–4:00 AM. Platform unavailable.', timestamp: '3 days ago', read: true },
];

export function NotificationsPage() {
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (activeMembership?.role || user?.role || user?.roles?.[0] || 'student').toLowerCase();

  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<NotifType | 'all'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const remove = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  const filtered = notifications.filter((n) => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--color-primary-500)', color: '#fff', borderRadius: 999, padding: '2px 8px' }}>{unreadCount}</span>
            )}
          </h1>
          <p>All system alerts, grade updates, messages, and announcements</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}><Check size={16} /> Mark all read</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 2 }}>
          {(['all', 'unread'] as const).map((f) => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
          <select className="form-input" style={{ width: 'auto' }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
            <option value="all">All Types</option>
            <option value="grade">Grades</option>
            <option value="homework">Homework</option>
            <option value="attendance">Attendance</option>
            <option value="message">Messages</option>
            <option value="announcement">Announcements</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <Bell size={40} style={{ opacity: 0.3, marginBottom: 'var(--space-3)' }} />
          <p>No notifications to show.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {filtered.map((n) => {
            const Icon = TYPE_ICON[n.type];
            const color = TYPE_COLOR[n.type];
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: 'flex', gap: 'var(--space-4)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)',
                  background: n.read ? 'var(--bg-secondary)' : 'var(--bg-primary)',
                  border: `1px solid ${n.read ? 'var(--border-color)' : color + '44'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: n.read ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: n.read ? 500 : 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0, marginLeft: 'var(--space-4)' }}>
                      {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{n.timestamp}</span>
                      <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }} onClick={(e) => { e.stopPropagation(); remove(n.id); }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 4 }}>{n.body}</p>
                  {n.course && <span className="badge badge-info" style={{ marginTop: 6, fontSize: '0.6875rem' }}>{n.course}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
