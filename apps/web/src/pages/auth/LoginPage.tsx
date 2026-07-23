import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../api/services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import { useTranslation, LanguageSwitcher } from '../../providers/LanguageProvider';

const demoCredentials = [
  { role: 'Super Admin', email: 'admin@campusos.internal', pass: 'SuperAdminSecret123!' },
  { role: 'Org Admin', email: 'orgadmin@apex.edu', pass: 'DemoPass123!' },
  { role: 'Branch Admin', email: 'branchadmin@apex.edu', pass: 'DemoPass123!' },
  { role: 'Teacher', email: 'teacher@apex.edu', pass: 'DemoPass123!' },
  { role: 'Assistant Teacher', email: 'assistant@apex.edu', pass: 'DemoPass123!' },
  { role: 'Student', email: 'student@apex.edu', pass: 'DemoPass123!' },
  { role: 'Parent', email: 'parent@apex.edu', pass: 'DemoPass123!' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { t } = useTranslation();

  const handleSelectDemoUser = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      if (response.success) {
        setAuth(
          response.data.accessToken,
          response.data.user,
          response.data.organizationId,
          response.data.theme as any
        );
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.warn('Backend login fallback:', err);
      // Fallback auth for development preview
      setAuth(
        'demo_access_token_123',
        {
          id: 'u_demo',
          email,
          firstName: email.split('@')[0],
          lastName: 'Account',
        },
        'default'
      );
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel" style={{ position: 'relative', overflowY: 'auto' }}>
        <div style={{ position: 'absolute', top: '24px', right: '24px' }}>
          <LanguageSwitcher />
        </div>
        <div className="auth-form-container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
          <div className="auth-brand">
            <div className="auth-brand-icon">C</div>
            <span className="auth-brand-name">CampusOS</span>
          </div>

          <h1 className="auth-title">{t('welcomeBack')}</h1>
          <p className="auth-subtitle">
            {t('loginSubtitle')}
          </p>

          {/* Quick Role Credentials Selector */}
          <div style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>
              🔑 Quick Demo Credentials (Click to prefill):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {demoCredentials.map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleSelectDemoUser(item.email, item.pass)}
                  className="btn btn-ghost"
                  style={{
                    fontSize: '0.6875rem',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: email === item.email ? '1px solid var(--color-primary-500)' : '1px solid var(--border-color)',
                    background: email === item.email ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-secondary)',
                    fontWeight: email === item.email ? 700 : 500,
                  }}
                >
                  {item.role}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--color-danger-500)', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                {t('emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                {t('passwordLabel')}
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-6)',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" style={{ fontSize: '0.875rem' }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: 'var(--space-3)' }}
              disabled={loading}
            >
              {loading ? t('signingIn') : t('signInBtn')}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: 'var(--space-6)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}
          >
            Don't have an account?{' '}
            <a href="#">Contact your administrator</a>
          </p>
        </div>
      </div>

      <div className="auth-hero">
        <div className="auth-hero-content">
          <h2 className="auth-hero-title">
            {t('heroTitle')}
          </h2>
          <p className="auth-hero-desc">
            {t('heroSubtitle')}
          </p>
        </div>
      </div>
    </div>
  );
}
