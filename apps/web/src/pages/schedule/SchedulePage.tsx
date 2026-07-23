import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'class' | 'exam' | 'homework' | 'meeting' | 'holiday';
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  course?: string;
}

const TYPE_COLORS: Record<string, string> = {
  class:    '#6366f1',
  exam:     '#ef4444',
  homework: '#f59e0b',
  meeting:  '#10b981',
  holiday:  '#8b5cf6',
};

const MOCK_EVENTS: CalendarEvent[] = [
  { id: '1', title: 'CS301 — Data Structures', type: 'class',    date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '10:30', location: 'Hall B', course: 'CS301' },
  { id: '2', title: 'PHYS101 — Lecture',       type: 'class',    date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '15:30', location: 'Lab 3',   course: 'PHYS101' },
  { id: '3', title: 'Midterm Exam',             type: 'exam',     date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], startTime: '10:00', endTime: '12:00', location: 'Exam Hall', course: 'CS301' },
  { id: '4', title: 'Assignment 4 Due',         type: 'homework', date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], startTime: '23:59', endTime: '23:59', course: 'MATH202' },
  { id: '5', title: 'Faculty Meeting',          type: 'meeting',  date: new Date(Date.now() + 86400000).toISOString().split('T')[0],     startTime: '13:00', endTime: '14:00', location: 'Room 101' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function SchedulePage() {
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (activeMembership?.role || user?.role || user?.roles?.[0] || 'student').toLowerCase();
  const isTeacherOrAdmin = ['teacher', 'assistant_teacher', 'org_admin', 'branch_admin', 'super_admin'].includes(userRole);

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [view, setView] = useState<'month' | 'week'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return MOCK_EVENTS.filter((e) => e.date === dateStr);
  };

  const todayEvents = MOCK_EVENTS.filter((e) => e.date === today.toISOString().split('T')[0]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Schedule & Calendar</h1>
          <p>{isTeacherOrAdmin ? 'Manage timetables, room bookings, and academic calendar events' : 'Your upcoming classes, exams, and deadlines'}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: 2 }}>
            {(['month', 'week'] as const).map((v) => (
              <button key={v} className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView(v)} style={{ textTransform: 'capitalize' }}>{v}</button>
            ))}
          </div>
          {isTeacherOrAdmin && (
            <button className="btn btn-primary"><Plus size={16} /> Add Event</button>
          )}
        </div>
      </div>

      <div className="content-grid">
        {/* Calendar */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><ChevronLeft size={18} /></button>
            <h2 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{MONTHS[month]} {year}</h2>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><ChevronRight size={18} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: 'center', padding: 'var(--space-2)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{d}</div>
            ))}
            {cells.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const events = getEventsForDay(day);
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              return (
                <div key={day} style={{ minHeight: 80, padding: 'var(--space-2)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: isToday ? 'rgba(99,102,241,0.06)' : 'transparent' }}>
                  <div style={{ fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--color-primary-500)' : 'var(--text-primary)', fontSize: '0.875rem', marginBottom: 4 }}>{day}</div>
                  {events.slice(0, 2).map((ev) => (
                    <div key={ev.id} style={{ fontSize: '0.6875rem', padding: '2px 4px', borderRadius: 3, marginBottom: 2, background: `${TYPE_COLORS[ev.type]}22`, color: TYPE_COLORS[ev.type], fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                  ))}
                  {events.length > 2 && <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>+{events.length - 2} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header"><h3 style={{ fontWeight: 600 }}>Today's Schedule</h3></div>
          {todayEvents.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', padding: 'var(--space-4)' }}>No events scheduled for today.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {todayEvents.map((ev) => (
                <div key={ev.id} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${TYPE_COLORS[ev.type]}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ev.title}</div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 4 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {ev.startTime} – {ev.endTime}</span>
                      {ev.location && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11} /> {ev.location}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: TYPE_COLORS[ev.type], alignSelf: 'center', textTransform: 'uppercase' }}>{ev.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="card-header"><h3 style={{ fontWeight: 600 }}>Upcoming</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {MOCK_EVENTS.filter((e) => e.date > today.toISOString().split('T')[0]).slice(0, 5).map((ev) => (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLORS[ev.type], flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{ev.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ev.date} · {ev.startTime}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
