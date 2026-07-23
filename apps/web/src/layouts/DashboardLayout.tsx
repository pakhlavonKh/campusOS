import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  MessageSquare,
  Bell,
  Settings,
  Users,
  Search,
  LogOut,
  GraduationCap,
  MessageCircle,
  Building2,
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useTranslation, LanguageSwitcher } from '../providers/LanguageProvider';

interface NavLinkItem {
  to: string;
  label: string;
  key: string;
  icon: any;
  roles?: string[]; // If omitted, visible to all
}

interface NavSection {
  section: string;
  roles?: string[];
  links: NavLinkItem[];
}

const allNavSections: NavSection[] = [
  {
    section: 'overview',
    links: [
      { to: '/dashboard', label: 'Dashboard', key: 'dashboard', icon: LayoutDashboard },
      { to: '/organizations', label: 'Organizations', key: 'organizations', icon: Building2, roles: ['super_admin'] },
    ],
  },
  {
    section: 'academic',
    roles: ['super_admin', 'org_admin', 'branch_admin', 'teacher', 'assistant_teacher', 'student'],
    links: [
      { to: '/courses', label: 'Courses', key: 'courses', icon: BookOpen, roles: ['super_admin', 'org_admin', 'branch_admin', 'teacher', 'assistant_teacher', 'student'] },
      { to: '/attendance', label: 'Attendance', key: 'attendance', icon: ClipboardCheck },
      { to: '/gradebook', label: 'Gradebook', key: 'gradebook', icon: GraduationCap },
    ],
  },
  {
    section: 'communication',
    links: [
      { to: '/messaging', label: 'Messaging', key: 'messaging', icon: MessageSquare },
      { to: '/discussions', label: 'Discussions', key: 'discussions', icon: MessageCircle, roles: ['super_admin', 'org_admin', 'branch_admin', 'teacher', 'assistant_teacher', 'student'] },
    ],
  },
  {
    section: 'system',
    roles: ['super_admin', 'org_admin', 'branch_admin'],
    links: [
      { to: '/users', label: 'Users', key: 'users', icon: Users, roles: ['super_admin', 'org_admin', 'branch_admin'] },
      { to: '/settings', label: 'Settings', key: 'settings', icon: Settings, roles: ['super_admin', 'org_admin', 'branch_admin'] },
    ],
  },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state: any) => state.logout);
  const user = useAuthStore((state: any) => state.user);
  const whiteLabelConfig = useAuthStore((state: any) => state.whiteLabelConfig);
  const layoutVariant = whiteLabelConfig?.layoutVariant || 'sidebar';
  const { t } = useTranslation();

  const userRole = (user?.role || user?.roles?.[0] || 'student').toLowerCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
      settings: t('settings'),
      organizations: 'Organizations Management',
      admin: t('globalDashboard'),
    };
    return titles[path] || 'CampusOS';
  };

  // Filter sections and links by active user role
  const filteredNavSections = allNavSections
    .filter((sec) => !sec.roles || sec.roles.includes(userRole))
    .map((sec) => ({
      ...sec,
      links: sec.links.filter((link) => !link.roles || link.roles.includes(userRole)),
    }))
    .filter((sec) => sec.links.length > 0);

  const allLinks = filteredNavSections.flatMap((section) => section.links);

  const userDisplayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'User Account';

  const userInitials = (user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'SUPER ADMIN', class: 'badge-purple' };
      case 'org_admin':
      case 'branch_admin':
        return { label: 'ADMIN', class: 'badge-info' };
      case 'teacher':
      case 'assistant_teacher':
        return { label: 'TEACHER', class: 'badge-warning' };
      case 'parent':
        return { label: 'PARENT', class: 'badge-purple' };
      default:
        return { label: 'STUDENT', class: 'badge-success' };
    }
  };

  const roleBadge = getRoleBadge(userRole);

  if (layoutVariant === 'top_nav') {
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
                    {t(link.key) || link.label}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="avatar">{userInitials}</div>
              <span className={`badge ${roleBadge.class}`} style={{ fontSize: '0.6875rem' }}>
                {roleBadge.label}
              </span>
            </div>
            <button
              className="btn btn-ghost btn-icon"
              title={t('logout')}
              onClick={handleLogout}
              style={{ marginLeft: 'var(--space-2)' }}
            >
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
          {filteredNavSections.map((section) => (
            <div key={section.section} className="sidebar-section">
              <div className="sidebar-section-title">{t(section.section) || section.section}</div>
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
                    {t(link.key) || link.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User profile section at bottom */}
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
            <div className="avatar avatar-sm">{userInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {userDisplayName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span className={`badge ${roleBadge.class}`} style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
                  {roleBadge.label}
                </span>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon" title={t('logout')} onClick={handleLogout}>
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
          <div className="avatar">{userInitials}</div>
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
