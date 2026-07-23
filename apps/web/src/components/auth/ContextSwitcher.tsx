/**
 * ContextSwitcher — SRS §5.30 multi-membership context switch UI.
 *
 * Implements the Teams/Slack-style workspace picker requirement:
 * "If a user holds multiple Memberships, provide an in-app context switcher
 *  to move between them without a full re-login."
 *
 * Switching immediately re-scopes role-based rendering and navigates to
 * /dashboard so stale page content from the previous context is cleared.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Check, Building2, GitBranch } from 'lucide-react';
import { useAuthStore, Membership } from '../../store/auth.store';

// Role → display badge configuration
const ROLE_BADGE: Record<string, { label: string; color: string }> = {
  super_admin:       { label: 'SUPER ADMIN', color: '#7c3aed' },
  org_admin:         { label: 'ORG ADMIN',   color: '#2563eb' },
  branch_admin:      { label: 'BRANCH ADMIN',color: '#0891b2' },
  teacher:           { label: 'TEACHER',     color: '#d97706' },
  assistant_teacher: { label: 'ASSISTANT',   color: '#ca8a04' },
  student:           { label: 'STUDENT',     color: '#16a34a' },
  parent:            { label: 'PARENT',      color: '#9333ea' },
};

function getRoleBadge(role: string) {
  return ROLE_BADGE[role.toLowerCase()] ?? { label: role.toUpperCase(), color: '#6b7280' };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ContextSwitcherProps {
  /** Render as compact icon-only pill (for top-nav layout). Default: full card. */
  compact?: boolean;
}

export function ContextSwitcher({ compact = false }: ContextSwitcherProps) {
  const navigate = useNavigate();
  const memberships = useAuthStore((state) => state.memberships);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const switchMembership = useAuthStore((state) => state.switchMembership);

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Don't render anything if the user has only one membership — single-membership
  // users land directly in their role experience with no extra step (SRS §5.30).
  if (!activeMembership || memberships.length <= 1) return null;

  const badge = getRoleBadge(activeMembership.role);

  const handleSwitch = (m: Membership) => {
    if (m.id === activeMembership.id) {
      setOpen(false);
      return;
    }
    // SRS §5.30: "Switching context must immediately re-scope data and navigation."
    switchMembership(m.id);
    setOpen(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div ref={ref} style={{ position: 'relative', userSelect: 'none' }}>
      {/* Trigger button */}
      <button
        id="context-switcher-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '4px 8px' : '6px 10px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)')
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-tertiary)')
        }
      >
        {/* Role color dot */}
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: badge.color,
            flexShrink: 0,
          }}
        />
        {!compact && (
          <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {activeMembership.organizationName}
          </span>
        )}
        <span
          style={{
            fontSize: '0.625rem',
            fontWeight: 700,
            color: badge.color,
            letterSpacing: '0.04em',
          }}
        >
          {badge.label}
        </span>
        <ChevronDown
          size={12}
          style={{
            color: 'var(--text-secondary)',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Switch membership context"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            minWidth: 260,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            zIndex: 9000,
            overflow: 'hidden',
            animation: 'fadeInDown 0.12s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '10px 14px 8px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            Switch Context
          </div>

          {/* Membership list */}
          {memberships.map((m) => {
            const mb = getRoleBadge(m.role);
            const isActive = m.id === activeMembership.id;
            return (
              <div
                key={m.id}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSwitch(m)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: isActive ? 'rgba(99,102,241,0.07)' : 'transparent',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive)
                    (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = isActive
                    ? 'rgba(99,102,241,0.07)'
                    : 'transparent';
                }}
              >
                {/* Org icon */}
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 'var(--radius-md)',
                    background: `${mb.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {m.branchId ? (
                    <GitBranch size={15} style={{ color: mb.color }} />
                  ) : (
                    <Building2 size={15} style={{ color: mb.color }} />
                  )}
                </div>

                {/* Labels */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {m.organizationName}
                  </div>
                  {m.branchName && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {m.branchName}
                    </div>
                  )}
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 2,
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      color: mb.color,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {mb.label}
                  </span>
                </div>

                {/* Active indicator */}
                {isActive && <Check size={14} style={{ color: 'var(--color-primary-500)', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
