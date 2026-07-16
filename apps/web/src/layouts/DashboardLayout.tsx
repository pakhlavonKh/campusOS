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

const navItems = [
  {
    section: 'Overview',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    section: 'Academic',
    links: [
      { to: '/courses', label: 'Courses', icon: BookOpen },
      { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
      { to: '/gradebook', label: 'Gradebook', icon: GraduationCap },
    ],
  },
  {
    section: 'Communication',
    links: [
      { to: '/messaging', label: 'Messaging', icon: MessageSquare },
      { to: '/discussions', label: 'Discussions', icon: MessageCircle },
    ],
  },
  {
    section: 'System',
    links: [
      { to: '/users', label: 'Users', icon: Users },
      { to: '/analytics', label: 'Analytics', icon: BarChart3 },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    section: 'Super Admin',
    links: [
      { to: '/admin', label: 'Global Dashboard', icon: ShieldAlert },
      { to: '/admin/organizations', label: 'Organizations', icon: Building2 },
    ],
  },
];

export function DashboardLayout() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      courses: 'Courses',
      attendance: 'Attendance',
      messaging: 'Messaging',
      users: 'Users',
      analytics: 'Analytics',
      settings: 'Settings',
    };
    return titles[path] || 'CampusOS';
  };

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
              <div className="sidebar-section-title">{section.section}</div>
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? 'active' : ''}`
                    }
                  >
                    <Icon />
                    {link.label}
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
                }}
              >
                Admin User
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
            <button className="btn btn-ghost btn-icon" title="Logout">
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
        <div className="topbar-right">
          <div className="topbar-search">
            <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
            <input placeholder="Search anything..." />
            <kbd>⌘K</kbd>
          </div>
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
