import React, { useState } from 'react';
import {
  Building2,
  User,
  ShieldCheck,
  Bell,
  Palette,
  Globe,
  Save,
  CheckCircle2,
  Lock,
  Key,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation, Language } from '../../providers/LanguageProvider';

export function SettingsPage() {
  const { whiteLabelConfig, setWhiteLabelConfig } = useAuthStore();
  const { language, setLanguage } = useTranslation();

  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'security' | 'notifications'>('branding');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [orgName, setOrgName] = useState('CampusOS Education Institute');
  const [primaryColor, setPrimaryColor] = useState(
    whiteLabelConfig?.tokens?.colorPrimary || '#6366f1'
  );
  const [secondaryColor, setSecondaryColor] = useState(
    whiteLabelConfig?.tokens?.colorSecondary || '#4f46e5'
  );
  const [fontFamily, setFontFamily] = useState(
    whiteLabelConfig?.tokens?.fontFamily || 'Inter'
  );

  // Profile State
  const [userName, setUserName] = useState('Dr. Sarah Jenkins');
  const [userEmail, setUserEmail] = useState('s.jenkins@campusos.edu');

  // Notifications State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Security State
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Apply updated white-label branding tokens
    setWhiteLabelConfig({
      tier: 'token',
      tokens: {
        colorPrimary: primaryColor,
        colorSecondary: secondaryColor,
        fontFamily,
        logoUrl: null,
        faviconUrl: null,
        customDomain: null,
      },
      layoutVariant: whiteLabelConfig?.layoutVariant || 'sidebar',
      customBuildRef: null,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="page-header-left">
          <h1>System Settings</h1>
          <p>Configure organization branding, profile preferences, security, and alerts</p>
        </div>
        {savedSuccess && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#10b981',
              fontWeight: 600,
              fontSize: '0.875rem',
              background: 'rgba(16, 185, 129, 0.1)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
            }}
          >
            <CheckCircle2 size={18} /> Settings saved successfully!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'branding' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
            color: activeTab === 'branding' ? 'var(--color-primary-500)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'branding' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <Palette size={18} /> Organization & Branding
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'general' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
            color: activeTab === 'general' ? 'var(--color-primary-500)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'general' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <User size={18} /> Profile & Account
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'security' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
            color: activeTab === 'security' ? 'var(--color-primary-500)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'security' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <ShieldCheck size={18} /> Security & Auth
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'notifications' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
            color: activeTab === 'notifications' ? 'var(--color-primary-500)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'notifications' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
          }}
        >
          <Bell size={18} /> Notifications
        </button>
      </div>

      <form onSubmit={handleSave}>
        {/* Tab 1: Organization & Branding */}
        {activeTab === 'branding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} style={{ color: 'var(--color-primary-500)' }} /> Institution Identity
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Organization Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Font Family
                  </label>
                  <select className="form-input" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                    <option value="Inter">Inter (System Default)</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Outfit">Outfit</option>
                    <option value="System">System Sans</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={20} style={{ color: 'var(--color-primary-500)' }} /> Theme Colors (White-label Tokens)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Primary Brand Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ width: '44px', height: '44px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Secondary / Accent Color
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      style={{ width: '44px', height: '44px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Profile & Account */}
        {activeTab === 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} style={{ color: 'var(--color-primary-500)' }} /> Personal Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Interface Language
                </label>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                  {(['en', 'ru', 'uz'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setLanguage(lang)}
                      className={`btn ${language === lang ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Globe size={16} /> {lang === 'en' ? 'English (EN)' : lang === 'ru' ? 'Русский (RU)' : 'Oʻzbekcha (UZ)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Auth */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} style={{ color: 'var(--color-primary-500)' }} /> Authentication & Session Rules
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>Two-Factor Authentication (2FA)</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>Require TOTP authenticator code on login</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={mfaEnabled}
                    onChange={(e) => setMfaEnabled(e.target.checked)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Session Timeout (Minutes)
                  </label>
                  <select className="form-input" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="60">60 Minutes</option>
                    <option value="120">2 Hours</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card" style={{ padding: 'var(--space-6)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell size={20} style={{ color: 'var(--color-primary-500)' }} /> Notification Preferences
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Email Notifications</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Receive course announcements and grade posts by email</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Push Notifications</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Receive real-time mobile push notifications for instant messages</div>
                  </div>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={weeklyDigest}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Weekly Academic Summary</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Weekly summary email containing attendance & performance metrics</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Save Button Bar */}
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
