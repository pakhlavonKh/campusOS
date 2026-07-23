import React, { useState, useEffect } from 'react';
import { Save, Check, Shield, Bell, Palette, Globe } from 'lucide-react';
import { usersService, UserProfile } from '../../api/services/users.service';
import { organizationsService, WhiteLabelConfig, Organization } from '../../api/services/organizations.service';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'security' | 'notifications'>('branding');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tenant / Branding Settings State
  const [orgName, setOrgName] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [secondaryColor, setSecondaryColor] = useState('#4f46e5');
  const [fontFamily, setFontFamily] = useState('Inter');

  // User Profile Settings State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Notification Settings State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const [profileRes, orgRes, wlRes] = await Promise.allSettled([
          usersService.getProfile(),
          organizationsService.getMyOrg(),
          organizationsService.getWhiteLabel(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value?.success) {
          const u = profileRes.value.data;
          setUserName(u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : u.email || '');
          setUserEmail(u.email || '');
        }

        if (orgRes.status === 'fulfilled' && orgRes.value?.success) {
          setOrgName(orgRes.value.data.name || 'CampusOS Organization');
        }

        if (wlRes.status === 'fulfilled' && wlRes.value?.success) {
          const wl = wlRes.value.data.tokens;
          if (wl?.colorPrimary) setPrimaryColor(wl.colorPrimary);
          if (wl?.colorSecondary) setSecondaryColor(wl.colorSecondary);
          if (wl?.fontFamily) setFontFamily(wl.fontFamily);
        }
      } catch (err) {
        console.warn('Backend settings endpoint returned empty or error.', err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'branding') {
        await organizationsService.updateWhiteLabel({
          tokens: {
            colorPrimary: primaryColor,
            colorSecondary: secondaryColor,
            fontFamily,
          },
        });
      } else if (activeTab === 'general') {
        const parts = userName.split(' ');
        await usersService.updateProfile({
          firstName: parts[0],
          lastName: parts.slice(1).join(' '),
        });
      }
    } catch (err) {
      console.warn('Settings update API call error.', err);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Settings & White-Label Customization</h1>
          <p>Configure institution branding, security policies, and user notifications</p>
        </div>
        <button className="btn btn-primary" onClick={handleSaveSettings}>
          {savedSuccess ? <Check size={16} /> : <Save size={16} />}
          {savedSuccess ? 'Settings Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-color)', marginBottom: 'var(--space-6)' }}>
        {[
          { id: 'branding', label: 'White-Label Branding', icon: Palette },
          { id: 'general', label: 'User Profile & General', icon: Globe },
          { id: 'security', label: 'Security & Auth', icon: Shield },
          { id: 'notifications', label: 'Notifications', icon: Bell },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === t.id ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                color: activeTab === t.id ? 'var(--color-primary-500)' : 'var(--text-secondary)',
                fontWeight: activeTab === t.id ? 600 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading live settings from backend...
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '700px', padding: 'var(--space-6)' }}>
          {activeTab === 'branding' && (
            <form onSubmit={handleSaveSettings}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Institution Branding Tokens</h2>
              
              <div className="form-group">
                <label className="form-label">Organization Display Name</label>
                <input
                  className="form-input"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="CampusOS Education Institute"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Primary Color Theme</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ width: '40px', height: '38px', padding: 0, border: 'none', cursor: 'pointer' }}
                    />
                    <input
                      className="form-input"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Secondary Color Theme</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      style={{ width: '40px', height: '38px', padding: 0, border: 'none', cursor: 'pointer' }}
                    />
                    <input
                      className="form-input"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Typography Font Family</label>
                <select className="form-input" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
                  <option value="Inter">Inter (Default)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Outfit">Outfit</option>
                  <option value="System">System UI</option>
                </select>
              </div>
            </form>
          )}

          {activeTab === 'general' && (
            <form onSubmit={handleSaveSettings}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>User Profile Settings</h2>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Security & Authentication</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Multi-Factor Authentication (MFA)</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Require TOTP authenticator for sign-in</div>
                  </div>
                  <span className="badge badge-success">Enabled</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Session Expiration</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Automatic logout after inactivity</div>
                  </div>
                  <span className="badge badge-info">30 Minutes</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Notification Preferences</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                  />
                  <span>Receive email alerts for course grade releases and assignments</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={pushAlerts}
                    onChange={(e) => setPushAlerts(e.target.checked)}
                  />
                  <span>Enable push notifications for direct messages and announcements</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
