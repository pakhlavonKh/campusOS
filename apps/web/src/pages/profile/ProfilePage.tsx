import { useState } from 'react';
import { User, Mail, Phone, Camera, Save, Key, Bell, Globe, Palette, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

type ProfileTab = 'personal' | 'security' | 'notifications' | 'appearance';

export function ProfilePage() {
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (activeMembership?.role || user?.role || user?.roles?.[0] || 'student').toLowerCase();

  const [activeTab, setActiveTab] = useState<ProfileTab>('personal');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('+1 (555) 000-0000');
  const [bio, setBio] = useState('');
  const [saved, setSaved] = useState(false);

  // Notification prefs
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [gradeNotifs, setGradeNotifs] = useState(true);
  const [attendanceNotifs, setAttendanceNotifs] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const userInitials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'U';

  const TABS: { id: ProfileTab; label: string; icon: typeof User }[] = [
    { id: 'personal',      label: 'Personal Info',    icon: User },
    { id: 'security',      label: 'Password & Security', icon: Shield },
    { id: 'notifications', label: 'Notifications',    icon: Bell },
    { id: 'appearance',    label: 'Appearance',       icon: Palette },
  ];

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 2,
        background: value ? 'var(--color-primary-500)' : 'var(--bg-tertiary)',
        transition: 'background 0.2s', position: 'relative',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: '#fff',
        transform: value ? 'translateX(20px)' : 'translateX(0)',
        transition: 'transform 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
      }} />
    </button>
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Profile & Settings</h1>
          <p>Manage your personal information, security settings, and preferences</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        {/* Sidebar */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Avatar section */}
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--color-primary-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700 }}>
                {userInitials}
              </div>
              <button className="btn btn-ghost btn-icon" style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '50%' }}>
                <Camera size={13} />
              </button>
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>{user?.email}</div>
            <span className="badge badge-purple" style={{ marginTop: 'var(--space-2)', fontSize: '0.6875rem' }}>
              {userRole.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Tab Nav */}
          <nav style={{ padding: 'var(--space-3)' }}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)', width: '100%', padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: activeTab === id ? 'rgba(99,102,241,0.08)' : 'transparent',
                color: activeTab === id ? 'var(--color-primary-500)' : 'var(--text-secondary)',
                fontWeight: activeTab === id ? 600 : 400, fontSize: '0.875rem',
              }}>
                <Icon size={16} />{label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Panel */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          {activeTab === 'personal' && (
            <form onSubmit={handleSave}>
              <h2 style={{ fontWeight: 600, marginBottom: 'var(--space-6)' }}>Personal Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={4} placeholder="Tell us a bit about yourself..." value={bio} onChange={(e) => setBio(e.target.value)} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                <button type="submit" className={`btn ${saved ? 'btn-secondary' : 'btn-primary'}`}>
                  <Save size={16} /> {saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontWeight: 600, marginBottom: 'var(--space-6)' }}>Password & Security</h2>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" placeholder="Enter your current password" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" placeholder="At least 12 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" placeholder="Repeat new password" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary"><Key size={16} /> Update Password</button>
              </div>
              <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Shield size={16} style={{ color: 'var(--color-primary-500)' }} /> Two-Factor Authentication</div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>Add an extra layer of security using an authenticator app or SMS code.</p>
                <button className="btn btn-secondary">Enable 2FA</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontWeight: 600, marginBottom: 'var(--space-6)' }}>Notification Preferences</h2>
              {[
                { label: 'Email Notifications', description: 'Receive a daily digest of important updates via email', value: emailNotifs, toggle: () => setEmailNotifs((v) => !v) },
                { label: 'Grade Updates', description: 'Notify when new grades or feedback are posted', value: gradeNotifs, toggle: () => setGradeNotifs((v) => !v) },
                { label: 'Attendance Alerts', description: 'Notify about attendance marking and corrections', value: attendanceNotifs, toggle: () => setAttendanceNotifs((v) => !v) },
                { label: 'New Messages', description: 'In-app and email alerts for new direct messages', value: messageNotifs, toggle: () => setMessageNotifs((v) => !v) },
              ].map(({ label, description, value, toggle }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{label}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 2 }}>{description}</div>
                  </div>
                  <Toggle value={value} onChange={toggle} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h2 style={{ fontWeight: 600, marginBottom: 'var(--space-6)' }}>Appearance</h2>
              <div className="form-group">
                <label className="form-label">Language</label>
                <select className="form-input">
                  <option>English (US)</option>
                  <option>Uzbek (O'zbek)</option>
                  <option>Russian (Русский)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select className="form-input">
                  <option>UTC+5:00 (Tashkent)</option>
                  <option>UTC-5:00 (New York)</option>
                  <option>UTC+0:00 (London)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-primary"><Save size={16} /> Save Preferences</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
