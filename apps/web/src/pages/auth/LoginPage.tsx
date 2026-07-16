import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../api/services/auth.service';
import { useAuthStore } from '../../store/auth.store';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

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
          response.data.theme
        );
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-panel">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-brand">
            <div className="auth-brand-icon">C</div>
            <span className="auth-brand-name">CampusOS</span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">
            Sign in to your account to continue
          </p>

          {error && (
            <div style={{ color: 'var(--color-danger-500)', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address
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
                Password
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
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              marginTop: 'var(--space-8)',
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
            Your Complete
            <br />
            Education Platform
          </h2>
          <p className="auth-hero-desc">
            Manage courses, track attendance, grade assignments, and engage
            students — all from one powerful, subject-agnostic platform built
            for modern education.
          </p>
        </div>
      </div>
    </div>
  );
}
