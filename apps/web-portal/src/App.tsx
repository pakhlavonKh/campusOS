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
  ChevronRight,
  Clock,
  Send,
  Upload,
  AlertTriangle,
  Play,
  Volume2,
  FileText,
  DollarSign,
  Check,
} from 'lucide-react';
import { Button, Badge, Card } from '@campusos/ui';
import { usePortalAuthStore } from './store/auth.store';

export default function App() {
  const { user, activeRole, switchRole, setActiveChild, logout } = usePortalAuthStore();
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'courses' | 'grades' | 'attendance' | 'schedule' | 'messages' | 'payments' | 'voice'
  >('dashboard');

  // Interactive states
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showHomeworkModal, setShowHomeworkModal] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Dr. Smith', text: 'Hello Alex, please don’t forget to review Chapter 4 before tomorrow’s lab.', time: '10:15 AM' },
    { sender: 'You', text: 'Thank you Dr. Smith! Working on problem set 3 now.', time: '10:22 AM' },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [speechScore, setSpeechScore] = useState<number | null>(null);

  const activeChild = user?.children?.find((c) => c.id === (user.activeChildId || 'c1'));

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    setChatMessages([...chatMessages, { sender: 'You', text: messageInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setMessageInput('');
  };

  const handleSimulateVoiceRec = () => {
    setIsRecording(true);
    setSpeechScore(null);
    setTimeout(() => {
      setIsRecording(false);
      setSpeechScore(94);
    }, 2500);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-page)' }}>
      {/* Sidebar Navigation */}
      <aside
        style={{
          width: 260,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap style={{ color: '#fff', width: 22, height: 22 }} />
          </div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>CampusOS</h1>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Student & Parent Portal</p>
          </div>
        </div>

        {/* Role & Context Switcher (SRS §5.27, §5.30) */}
        <div style={{ padding: '14px 16px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Portal View Mode
          </label>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <button
              onClick={() => switchRole('student')}
              style={{
                flex: 1, padding: '6px 10px', fontSize: 12, fontWeight: 600, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                background: activeRole === 'student' ? 'var(--color-primary)' : 'transparent',
                color: activeRole === 'student' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              Student
            </button>
            <button
              onClick={() => switchRole('parent')}
              style={{
                flex: 1, padding: '6px 10px', fontSize: 12, fontWeight: 600, borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                background: activeRole === 'parent' ? 'var(--color-primary)' : 'transparent',
                color: activeRole === 'parent' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              Parent
            </button>
          </div>

          {/* Child Selector for Parent View */}
          {activeRole === 'parent' && user?.children && (
            <div style={{ marginTop: 10 }}>
              <label style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Linked Child</label>
              <select
                value={user.activeChildId || 'c1'}
                onChange={(e) => setActiveChild(e.target.value)}
                style={{
                  width: '100%', marginTop: 4, padding: '6px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)',
                  color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: 12, fontWeight: 600,
                }}
              >
                {user.children.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.grade})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
            { id: 'courses', label: 'My Courses', icon: BookOpen },
            { id: 'grades', label: 'Grades & Report', icon: Award },
            { id: 'attendance', label: 'Attendance', icon: CheckCircle2 },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'messages', label: 'Messages', icon: MessageSquare },
            { id: 'payments', label: 'Payments', icon: CreditCard, parentOnly: true },
            { id: 'voice', label: 'Voice Practice', icon: Mic },
          ]
            .filter((item) => !item.parentOnly || activeRole === 'parent')
            .map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 'var(--radius-md)', border: 'none',
                    background: active ? 'var(--color-primary-light)' : 'transparent',
                    color: active ? 'var(--color-primary)' : 'var(--text-secondary)',
                    fontWeight: active ? 600 : 500, fontSize: 13, cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.12s',
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
        </nav>

        {/* User Footer */}
        <div style={{ padding: 16, borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
            {activeRole === 'parent' ? 'P' : user?.avatar || 'AJ'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {activeRole === 'parent' ? 'Parent View' : user?.name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.organizationName}</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        <header style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Viewing portal for <strong style={{ color: 'var(--color-primary)' }}>{activeRole === 'parent' ? activeChild?.name : user?.name}</strong>
            </p>
          </div>
          <Badge variant="success">Semester 1 — 2026</Badge>
        </header>

        {/* ── 1. DASHBOARD TAB ─────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              <Card title="Overall Progress" subtitle="Course completion rate">
                <div style={{ fontSize: 34, fontWeight: 700, color: 'var(--color-primary)', marginTop: 8 }}>78%</div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>14 of 18 lessons completed</p>
              </Card>

              <Card title="Attendance Rate" subtitle="Current term summary">
                <div style={{ fontSize: 34, fontWeight: 700, color: 'var(--color-success)', marginTop: 8 }}>96.4%</div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>26 Present / 1 Excused</p>
              </Card>

              <Card title="Cumulative GPA" subtitle="Academic standing">
                <div style={{ fontSize: 34, fontWeight: 700, color: 'var(--text-primary)', marginTop: 8 }}>3.85</div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Grade Average: A (94.2%)</p>
              </Card>
            </div>

            {/* Upcoming Deadlines */}
            <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Upcoming Assignments & Deadlines</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { title: 'CS301 — Problem Set 4: Binary Trees', due: 'Tomorrow, 11:59 PM', type: 'Homework', status: 'Pending' },
                  { title: 'PHYS101 — Midterm Lab Report', due: 'Friday, 5:00 PM', type: 'Lab', status: 'In Progress' },
                  { title: 'MATH202 — Integration Quiz', due: 'Next Monday', type: 'Quiz', status: 'Upcoming' },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.type} · Due {item.due}</div>
                    </div>
                    <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => { setActiveTab('courses'); setShowHomeworkModal(true); }}>
                      Submit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 2. COURSES TAB ──────────────────────────────────────────────── */}
        {activeTab === 'courses' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {[
              { id: 'c1', code: 'CS301', title: 'Data Structures & Algorithms', teacher: 'Dr. Smith', progress: 85, lessons: 12 },
              { id: 'c2', code: 'PHYS101', title: 'Classical Physics & Mechanics', teacher: 'Prof. Adams', progress: 70, lessons: 10 },
              { id: 'c3', code: 'MATH202', title: 'Multivariable Calculus', teacher: 'Dr. Taylor', progress: 90, lessons: 15 },
              { id: 'c4', code: 'ENG120', title: 'Technical Writing', teacher: 'Prof. Miller', progress: 60, lessons: 8 },
            ].map((course) => (
              <div key={course.id} style={{ background: 'var(--bg-surface)', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', background: 'var(--color-primary-light)', padding: '3px 8px', borderRadius: 4 }}>
                    {course.code}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{course.lessons} Lessons</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{course.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>Instructor: {course.teacher}</p>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Progress</span>
                    <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{course.progress}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 99 }}>
                    <div style={{ width: `${course.progress}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 99 }} />
                  </div>
                </div>

                <button className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }} onClick={() => setSelectedCourse(course)}>
                  Open Course Material
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── 3. GRADES TAB ───────────────────────────────────────────────── */}
        {activeTab === 'grades' && (
          <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Semester 1 Grade Report</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 12 }}>Course</th>
                  <th style={{ padding: 12 }}>Midterm</th>
                  <th style={{ padding: 12 }}>Homework Avg</th>
                  <th style={{ padding: 12 }}>Overall Grade</th>
                  <th style={{ padding: 12, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { course: 'CS301 — Data Structures', midterm: '92%', hw: '95%', overall: '94.2% (A)', status: 'Passed' },
                  { course: 'PHYS101 — Physics', midterm: '88%', hw: '90%', overall: '89.0% (B+)', status: 'Passed' },
                  { course: 'MATH202 — Calculus II', midterm: '95%', hw: '98%', overall: '96.5% (A+)', status: 'Passed' },
                  { course: 'ENG120 — Technical Writing', midterm: '84%', hw: '86%', overall: '85.2% (B)', status: 'Passed' },
                ].map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{row.course}</td>
                    <td style={{ padding: 12, color: 'var(--text-secondary)' }}>{row.midterm}</td>
                    <td style={{ padding: 12, color: 'var(--text-secondary)' }}>{row.hw}</td>
                    <td style={{ padding: 12, fontWeight: 700, color: 'var(--color-primary)' }}>{row.overall}</td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <Badge variant="success">{row.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── 4. ATTENDANCE TAB ───────────────────────────────────────────── */}
        {activeTab === 'attendance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Attendance Roster</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'Present', count: 26, color: 'var(--color-success)' },
                  { label: 'Late', count: 1, color: 'var(--color-warning)' },
                  { label: 'Excused', count: 1, color: 'var(--color-info)' },
                  { label: 'Absent', count: 0, color: 'var(--color-danger)' },
                ].map((stat, idx) => (
                  <div key={idx} style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: stat.color, marginTop: 4 }}>{stat.count} Days</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 5. SCHEDULE TAB ─────────────────────────────────────────────── */}
        {activeTab === 'schedule' && (
          <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Weekly Timetable</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { time: '09:00 AM – 10:30 AM', title: 'CS301 Lecture', room: 'Hall B', day: 'Mon, Wed, Fri' },
                { time: '11:00 AM – 12:30 PM', title: 'MATH202 Recitation', room: 'Room 204', day: 'Tue, Thu' },
                { time: '02:00 PM – 03:30 PM', title: 'PHYS101 Physics Lab', room: 'Lab 3', day: 'Monday' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{item.day} · {item.room}</div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 6. MESSAGES TAB ─────────────────────────────────────────────── */}
        {activeTab === 'messages' && (
          <div style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', height: 480, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16, borderBottom: '1px solid var(--border-color)', fontWeight: 700 }}>Direct Message Thread — Dr. Smith</div>
            <div style={{ flex: 1, padding: 16, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{msg.sender} · {msg.time}</div>
                  <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-md)', background: msg.sender === 'You' ? 'var(--color-primary)' : 'var(--bg-tertiary)', color: '#fff', fontSize: 13 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: 12, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
              <input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: '#fff', fontSize: 13 }}
              />
              <button className="btn btn-primary" onClick={handleSendMessage}><Send size={16} /></button>
            </div>
          </div>
        )}

        {/* ── 7. PAYMENTS TAB (PARENT) ────────────────────────────────────── */}
        {activeTab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'var(--bg-surface)', padding: 24, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Tuition & Financial Statement</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Tuition Paid</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-success)', marginTop: 4 }}>$4,850.00</div>
                </div>
                <div style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pending Balance</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-warning)', marginTop: 4 }}>$200.00</div>
                </div>
                <div style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Next Due Date</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>Aug 15, 2026</div>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: 10 }}>Invoice #</th>
                    <th style={{ padding: 10 }}>Description</th>
                    <th style={{ padding: 10 }}>Amount</th>
                    <th style={{ padding: 10, textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'INV-2026-01', desc: 'Semester 1 Tuition Fee', amount: '$4,500.00', status: 'Paid' },
                    { id: 'INV-2026-02', desc: 'Science Lab Material Fee', amount: '$350.00', status: 'Paid' },
                    { id: 'INV-2026-03', desc: 'Technology & Library Access', amount: '$200.00', status: 'Pending' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 10, fontWeight: 600 }}>{row.id}</td>
                      <td style={{ padding: 10, color: 'var(--text-secondary)' }}>{row.desc}</td>
                      <td style={{ padding: 10, fontWeight: 700 }}>{row.amount}</td>
                      <td style={{ padding: 10, textAlign: 'right' }}>
                        <Badge variant={row.status === 'Paid' ? 'success' : 'warning'}>{row.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── 8. VOICE PRACTICE TAB (SRS §5.24) ──────────────────────────── */}
        {activeTab === 'voice' && (
          <div style={{ background: 'var(--bg-surface)', padding: 32, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <Mic size={48} style={{ color: 'var(--color-primary)', marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>AI Pronunciation & Voice Practice</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 24px' }}>
              Read the prompt below out loud to receive instant AI evaluation on pronunciation and fluency.
            </p>

            <div style={{ padding: 20, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 16, fontWeight: 600, color: 'var(--color-primary)' }}>
              "Binary search trees allow logarithmic time search, insertion, and deletion operations."
            </div>

            <button
              onClick={handleSimulateVoiceRec}
              disabled={isRecording}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: 15 }}
            >
              {isRecording ? 'Listening & Analyzing...' : 'Tap to Start Speaking'}
            </button>

            {speechScore !== null && (
              <div style={{ marginTop: 24, padding: 16, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', display: 'inline-block' }}>
                <div style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 700 }}>Pronunciation Score</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-success)' }}>{speechScore} / 100</div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
