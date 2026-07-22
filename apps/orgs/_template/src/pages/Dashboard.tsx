import React from 'react';
import { useTheme } from '../providers/ThemeProvider';
import { BookOpen, Users, Activity, ExternalLink } from 'lucide-react';

export function Dashboard() {
  const theme = useTheme();

  return (
    <div className="animate-fade-in" style={{ padding: 'var(--space-8)' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-8)' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)' }}>{theme.name} Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to your dedicated custom platform instance.</p>
        </div>
        <div>
          <span className="badge badge-success">Custom Tenant Build</span>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tenant ID</span>
            <div className="stat-icon purple">
              <Activity size={22} />
            </div>
          </div>
          <div className="card-value" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>
            {theme.tenantId}
          </div>
          <div className="card-change" style={{ color: 'var(--text-tertiary)' }}>
            Active Database Tenant
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">API Endpoint</span>
            <div className="stat-icon green">
              <BookOpen size={22} />
            </div>
          </div>
          <div className="card-value" style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)' }}>
            {theme.apiUrl}
          </div>
          <div className="card-change" style={{ color: 'var(--text-tertiary)' }}>
            Rest API Target Gateway
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Brand Styling</span>
            <div className="stat-icon amber">
              <Users size={22} />
            </div>
          </div>
          <div className="card-value" style={{ fontSize: '1.25rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: theme.tokens.colorPrimary }} />
            Primary Token
          </div>
          <div className="card-change" style={{ color: 'var(--text-tertiary)' }}>
            Hex Code: {theme.tokens.colorPrimary}
          </div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginTop: 'var(--space-6)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-3)' }}>Bespoke Styling Lab</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          This folder is isolated under <code>apps/orgs/{theme.name.toLowerCase().replace(/\s+/g, '-')}/</code>.
          You can edit components here to build unique designs for this customer.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-primary">
            Primary Button
          </button>
          <button className="btn btn-secondary">
            <ExternalLink size={16} /> Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
