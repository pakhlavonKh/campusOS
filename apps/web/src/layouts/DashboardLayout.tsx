import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  Bell,
  Settings,
  Users,
  BarChart3,
  Search,
  LogOut,
  GraduationCap,
  MessageCircle,
  ShieldAlert,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useTranslation, LanguageSwitcher } from '../providers/LanguageProvider';

const navItems = [
  {
    section: 'overview',
    links: [
      { to: '/dashboard', label: 'Dashboard', key: 'dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'academic',
    links: [
      { to: '/courses', label: 'Courses', key: 'courses', icon: BookOpen },
      { to: '/attendance', label: 'Attendance', key: 'attendance', icon: ClipboardCheck },
      { to: '/gradebook', label: 'Gradebook', key: 'gradebook', icon: GraduationCap },
    ],
  },
  {
    section: 'communication',
    links: [
      { to: '/messaging', label: 'Messaging', key: 'messaging', icon: MessageSquare },
      { to: '/discussions', label: 'Discussions', key: 'discussions', icon: MessageCircle },
    ],
  },
  {
    section: 'system',
    links: [
      { to: '/users', label: 'Users', key: 'users', icon: Users },
      { to: '/analytics', label: 'Analytics', key: 'analytics', icon: BarChart3 },
      { to: '/settings', label: 'Settings', key: 'settings', icon: Settings },
    ],
  },
  {
    section: 'superAdmin',
    links: [
      { to: '/admin', label: 'Global Dashboard', key: 'globalDashboard', icon: ShieldAlert },
      { to: '/admin/organizations', label: 'Organizations', key: 'organizations', icon: Building2 },
    ],
  },
];


export function DashboardLayout() {
  const location = useLocation();
  const whiteLabelConfig = useAuthStore((state: any) => state.whiteLabelConfig);
  const layoutVariant = whiteLabelConfig?.layoutVariant || 'sidebar';
  const { t } = useTranslation();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    const titles: Record<string, string> = {
      dashboard: t('dashboard'),
      courses: t('courses'),
      attendance: t('attendance'),
      messaging: t('messaging'),
      gradebook: t('gradebook'),
      discussions: t('discussions'),
      users: t('users'),
      analytics: t('analytics'),
      settings: t('settings'),
      admin: t('globalDashboard'),
    };
    return titles[path] || 'CampusOS';
  };

  const allLinks = navItems.flatMap((section) => section.links);

  if (layoutVariant === 'top_nav') {
    // ─── TIER 2: TOP NAVIGATION LAYOUT VARIANT ───
    return (
      <div className="app-layout" style={{ flexDirection: 'column' }}>
        {/* Top Navbar */}
        <header
          className="topbar"
          style={{
            left: 0,
            padding: '0 var(--space-6)',
            position: 'sticky',
            width: '100%',
          }}
        >
          <div className="topbar-left" style={{ gap: 'var(--space-6)' }}>
            <div className="sidebar-brand" style={{ borderBottom: 'none', padding: 0 }}>
              <div className="sidebar-brand-icon">C</div>
              <span className="sidebar-brand-text">CampusOS</span>
            </div>

            {/* Horizontal Navigation Links */}
            <nav style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {allLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }: { isActive: boolean }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      height: 'auto',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <Icon size={14} />
                    {t(link.key)}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="topbar-right" style={{ gap: 'var(--space-4)' }}>
            <div className="topbar-search">
              <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
              <input placeholder={t('searchPlaceholder')} />
            </div>
            <LanguageSwitcher />
            <button className="btn btn-ghost btn-icon" title="Notifications">
              <Bell size={20} />
            </button>
            <div className="avatar">A</div>
            <button className="btn btn-ghost btn-icon" title={t('logout')} style={{ marginLeft: 'var(--space-2)' }}>
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="main-content" style={{ marginLeft: 0, paddingTop: 0 }}>
          <div className="page-content">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // ─── DEFAULT SIDEBAR LAYOUT VARIANT ───
  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">C</div>
          <span className="sidebar-brand-text">CampusOS</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-section-title">{t(section.section)}</div>
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }: { isActive: boolean }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <Icon />
                    {t(link.key)}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User section at bottom */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-3)',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: 'var(--space-2) var(--space-3)',
            }}
          >
            <div className="avatar avatar-sm">A</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--text-primary)',
                }}
              >
                {t('adminUser')}
              </div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-tertiary)',
                }}
              >
                admin@campus.edu
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" title={t('logout')}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Top Bar */}
      <header className="topbar">
        <div className="topbar-left">
          <h2 className="topbar-title">{getPageTitle()}</h2>
        </div>
        <div className="topbar-right" style={{ gap: 'var(--space-4)' }}>
          <div className="topbar-search">
            <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
            <input placeholder={t('searchPlaceholder')} />
            <kbd>⌘K</kbd>
          </div>
          <LanguageSwitcher />
          <button className="btn btn-ghost btn-icon" title="Notifications">
            <Bell size={20} />
          </button>
          <div className="avatar">A</div>
        </div>
      </header>

      {/* Page Content */}
      <main className="main-content">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
