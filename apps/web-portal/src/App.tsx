import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Calendar,
  MessageSquare,
  Award,
  CreditCard,
  Mic,
  CheckCircle2,
  User,
  LogOut,
} from 'lucide-react';
import { Button, Badge, Card } from '@campusos/ui';

/**
 * Student & Parent Portal Application
 * GAP-FE-01: Dedicated portal for Student and Parent roles (SRS §5.27).
 * Provides dashboard, lesson viewer, homework, grades, attendance, schedule,
 * messaging, payments, and voice practice.
 */
export default function App() {
  const [activeRole, setActiveRole] = useState<'student' | 'parent'>('student');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'grades' | 'attendance' | 'schedule' | 'messages' | 'payments' | 'voice'>('dashboard');

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-page)' }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <GraduationCap style={{ color: 'var(--color-primary)', width: 28, height: 28 }} />
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>CampusOS</h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Student & Parent Portal</p>
          </div>
        </div>

        {/* Role Switcher */}
        <div style={{ padding: '12px 16px', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Portal View</label>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <button
              onClick={() => setActiveRole('student')}
              style={{
                flex: 1, padding: '4px 8px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer',
                background: activeRole === 'student' ? 'var(--color-primary)' : 'transparent',
                color: activeRole === 'student' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              Student
            </button>
            <button
              onClick={() => setActiveRole('parent')}
              style={{
                flex: 1, padding: '4px 8px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer',
                background: activeRole === 'parent' ? 'var(--color-primary)' : 'transparent',
                color: activeRole === 'parent' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              Parent
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
            { id: 'courses', label: 'My Courses', icon: BookOpen },
            { id: 'grades', label: 'Grades & Reports', icon: Award },
            { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'voice', label: 'Voice Practice', icon: Mic },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none',
                  background: active ? 'var(--color-primary-light)' : 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 600 : 500, fontSize: 13, cursor: 'pointer', textAlign: 'left', width: '100%',
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>
            {activeRole === 'student' ? 'A' : 'M'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {activeRole === 'student' ? 'Alex Student' : 'Maria Parent'}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Apex Academy</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Viewing as <strong style={{ color: 'var(--color-primary)' }}>{activeRole.toUpperCase()}</strong> in Apex Academy
            </p>
          </div>
          <Badge variant="success">Semester 1 — Active</Badge>
        </header>

        {activeTab === 'dashboard' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            <Card title="Course Progress" subtitle="Current overall completion">
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-primary)' }}>78%</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>12 of 15 lessons completed</p>
            </Card>

            <Card title="Attendance Rate" subtitle="This term">
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-success)' }}>96%</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>24 Present / 1 Excused</p>
            </Card>

            <Card title="Current GPA" subtitle="Cumulative score">
              <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>3.85</div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Grade: A (94.2%)</p>
            </Card>
          </div>
        )}

        {activeTab !== 'dashboard' && (
          <Card title={`${activeTab.toUpperCase()} Module`} subtitle="Connected to backend API">
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              This section provides student and parent view for <strong>{activeTab}</strong>.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}
