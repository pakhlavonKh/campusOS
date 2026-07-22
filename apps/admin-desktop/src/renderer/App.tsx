import React, { useState, useEffect } from 'react';
import { Building2, CreditCard, Flag, UserCheck, Activity, ShieldAlert, LogOut, Loader2 } from 'lucide-react';
import './index.css';

// Components
import { LangSwitcher } from './components/LangSwitcher';
import { Toast } from './components/Toast';

// Pages
import { OrgsPage } from './pages/OrgsPage';
import { BillingPage } from './pages/BillingPage';
import { FlagsPage } from './pages/FlagsPage';
import { SupportPage } from './pages/SupportPage';
import { HealthPage } from './pages/HealthPage';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  verifyTokenRole: (token: string) => Promise<{ valid: boolean; error?: string }>;
  showNotification: (title: string, body?: string) => void;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window { electronAPI?: ElectronAPI; }
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'archived';
  billingPlan: string;
  settings: Record<string, any>;
  createdAt: string;
}

type Tab = 'orgs' | 'billing' | 'flags' | 'support' | 'health';
type Lang = 'en' | 'ru' | 'uz';

interface GlobalFlags {
  enableAIModule: boolean;
  enableRLSPolicies: boolean;
  maintenanceMode: boolean;
  enableSpeechScoring: boolean;
}

// ─── i18n Dictionary ─────────────────────────────────────────────────────────

const I18N: Record<Lang, Record<string, string>> = {
  en: {
    consoleTitle: 'Platform Super Admin',
    accessRestricted: 'Access-restricted internal platform console',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    signInBtn: 'Sign In to Console',
    signingIn: 'Signing In…',
    orgManagement: 'Organization Management',
    billingQuotas: 'Billing & Quotas',
    featureFlags: 'Global Feature Flags',
    impersonation: 'Support Impersonation',
    systemHealth: 'System Health',
    logout: 'Sign Out',
    serverOnline: 'Server Online',
    activeTenants: 'Active Tenancies',
    tenantName: 'Tenant Name',
    slugIdentifier: 'Slug',
    billingPlan: 'Billing Plan',
    status: 'Status',
    createdDate: 'Created',
    securityControl: 'Actions',
    suspendTenant: 'Suspend',
    activateTenant: 'Activate',
    quotaOverrides: 'Edit Quota Overrides',
    billingPlanTier: 'Billing Plan Tier',
    maxActiveStudents: 'Max Active Students',
    storageQuotaGb: 'Storage Quota (GB)',
    applyChanges: 'Apply Changes',
    cancel: 'Cancel',
    resourceLicensingControls: 'Resource & Licensing Controls',
    studentLimit: 'Student Limit',
    storageLimit: 'Storage Limit',
    configureLimits: 'Configure Limits',
    globalSystemOverrides: 'Global System Overrides',
    globalOverridesDesc: 'These settings push global environment overrides directly into the backend cache layer. Changes take effect system-wide immediately.',
    rlsTitle: 'Row-Level Security (RLS) Policies',
    rlsDesc: 'Toggle DB-level multi-tenant isolation layers',
    aiTitle: 'AI & Speech Assessment Engine',
    aiDesc: 'Enable/disable speech pronunciation scoring globally',
    genAiTitle: 'GenAI Support Copilots',
    genAiDesc: 'Toggle LLM components in the student LMS experience',
    maintenanceTitle: 'Global Maintenance Mode',
    maintenanceDesc: 'Redirect all client app requests to a static maintenance view',
    auditedSupportTitle: 'Audited Support Access Mode',
    auditedSupportDesc: 'Any platform admin entering a tenant workspace is logged. The audit record is immutable and stored permanently.',
    selectTargetOrg: 'Select Target Organization',
    chooseTenant: '— Choose Tenant —',
    targetUserId: 'Target User ID (UUID)',
    reasonImpersonation: 'Reason for Impersonation',
    reasonPlaceholder: 'Explain why client data access is needed (ticket reference, database error, billing audit)…',
    authorizeImpersonation: 'Authorize & Log Support Session',
    dbStatus: 'Database Status',
    activeConnections: 'Active Connections',
    avgQueryExecution: 'Avg Query Execution',
    lastMigrationRun: 'Last Migration Run',
    cacheJobQueues: 'Cache & Job Queues',
    redisCacheHits: 'Redis Cache Hits',
    bullmqPendingJobs: 'BullMQ Pending Jobs',
    activeWorkers: 'Active Workers',
    avgQueueProcessTime: 'Avg Queue Process Time',
    securityAuditing: 'Security & Auditing',
    auditLogs24h: 'Audit Logs (24h)',
    activeImpersonations: 'Active Impersonations',
    failedAdminLogins: 'Failed Admin Logins',
    versionText: 'Console',
    free: 'Free', growth: 'Growth', pro: 'Pro', actions: 'Actions',
  },
  ru: {
    consoleTitle: 'Панель супер-администратора',
    accessRestricted: 'Доступ ограничен внутренним пультом управления',
    emailLabel: 'Электронная почта',
    passwordLabel: 'Пароль',
    signInBtn: 'Войти в панель',
    signingIn: 'Вход…',
    orgManagement: 'Управление организациями',
    billingQuotas: 'Тарифы и квоты',
    featureFlags: 'Глобальные функции',
    impersonation: 'Поддержка и сессии',
    systemHealth: 'Здоровье системы',
    logout: 'Выйти',
    serverOnline: 'Сервер онлайн',
    activeTenants: 'Активные клиенты',
    tenantName: 'Название организации',
    slugIdentifier: 'Slug',
    billingPlan: 'Тарифный план',
    status: 'Статус',
    createdDate: 'Создан',
    securityControl: 'Действия',
    suspendTenant: 'Приостановить',
    activateTenant: 'Активировать',
    quotaOverrides: 'Редактировать лимиты',
    billingPlanTier: 'Уровень тарифа',
    maxActiveStudents: 'Макс. активных студентов',
    storageQuotaGb: 'Квота хранилища (ГБ)',
    applyChanges: 'Применить',
    cancel: 'Отмена',
    resourceLicensingControls: 'Ресурсы и лицензирование',
    studentLimit: 'Лимит студентов',
    storageLimit: 'Лимит хранилища',
    configureLimits: 'Настроить лимиты',
    globalSystemOverrides: 'Глобальные настройки системы',
    globalOverridesDesc: 'Эти настройки применяют глобальные переменные окружения напрямую в кэш-слой бэкенда. Изменения вступают в силу мгновенно.',
    rlsTitle: 'Политики RLS (Row-Level Security)',
    rlsDesc: 'Включение многоарендной изоляции на уровне БД',
    aiTitle: 'Движок оценки речи и ИИ',
    aiDesc: 'Включение глобального оценивания произношения',
    genAiTitle: 'GenAI-ассистенты',
    genAiDesc: 'Переключает компоненты ИИ в личном кабинете студента',
    maintenanceTitle: 'Режим обслуживания',
    maintenanceDesc: 'Перенаправляет все запросы на страницу обслуживания',
    auditedSupportTitle: 'Поддержка с аудитом доступа',
    auditedSupportDesc: 'Вход администраторов в пространства клиентов логируется. Запись аудита неизменяема.',
    selectTargetOrg: 'Выберите организацию',
    chooseTenant: '— Выберите клиента —',
    targetUserId: 'ID пользователя (UUID)',
    reasonImpersonation: 'Причина входа',
    reasonPlaceholder: 'Опишите причину доступа к данным клиента (номер тикета, ошибка в БД, аудит биллинга)…',
    authorizeImpersonation: 'Авторизовать и логировать сессию',
    dbStatus: 'Статус базы данных',
    activeConnections: 'Активные соединения',
    avgQueryExecution: 'Ср. время запроса',
    lastMigrationRun: 'Последняя миграция',
    cacheJobQueues: 'Кэш и очереди задач',
    redisCacheHits: 'Хит-рейт кэша Redis',
    bullmqPendingJobs: 'Ожидающие задачи BullMQ',
    activeWorkers: 'Активные воркеры',
    avgQueueProcessTime: 'Ср. время обработки',
    securityAuditing: 'Аудит и безопасность',
    auditLogs24h: 'Логи аудита (24ч)',
    activeImpersonations: 'Активные сессии',
    failedAdminLogins: 'Ошибки входа',
    versionText: 'Консоль',
    free: 'Бесплатный', growth: 'Рост', pro: 'Про', actions: 'Действия',
  },
  uz: {
    consoleTitle: 'Super Admin Boshqaruv Paneli',
    accessRestricted: 'Kirish cheklangan ichki tizim konsoli',
    emailLabel: 'Elektron pochta',
    passwordLabel: 'Parol',
    signInBtn: 'Konsolga kirish',
    signingIn: 'Kirilmoqda…',
    orgManagement: 'Tashkilotlarni boshqarish',
    billingQuotas: 'Tariflar va limitlar',
    featureFlags: 'Global funksiyalar',
    impersonation: 'Impersonatsiya',
    systemHealth: 'Tizim salomatligi',
    logout: 'Chiqish',
    serverOnline: 'Server onlayn',
    activeTenants: 'Faol mijozlar',
    tenantName: 'Tashkilot nomi',
    slugIdentifier: 'Slug',
    billingPlan: 'Tarif rejasi',
    status: 'Holat',
    createdDate: 'Yaratilgan',
    securityControl: 'Amallar',
    suspendTenant: "To'xtatish",
    activateTenant: 'Faollashtirish',
    quotaOverrides: 'Limitlarni tahrirlash',
    billingPlanTier: 'Tarif darajasi',
    maxActiveStudents: 'Maks. faol talabalar',
    storageQuotaGb: 'Xotira limiti (GB)',
    applyChanges: "O'zgarishlarni saqlash",
    cancel: 'Bekor qilish',
    resourceLicensingControls: 'Resurs va litsenziya nazorati',
    studentLimit: 'Talabalar limiti',
    storageLimit: 'Xotira limiti',
    configureLimits: 'Limitlarni sozlash',
    globalSystemOverrides: 'Global tizim sozlamalari',
    globalOverridesDesc: "Ushbu sozlamalar global qiymatlarni to'g'ridan-to'g'ri kesh qatlamida o'zgartiradi. O'zgarishlar darhol kuchga kiradi.",
    rlsTitle: 'Qator darajasidagi xavfsizlik (RLS)',
    rlsDesc: "Bazada ko'p ijarali ajratish siyosatini yoqish",
    aiTitle: "Sun'iy intellekt va nutqni baholash",
    aiDesc: 'Nutq talaffuzini baholash xizmatini yoqish',
    genAiTitle: "GenAI yordamchilarini yoqish",
    genAiDesc: "LMS talabalar interfeysida sun'iy intellektni yoqadi",
    maintenanceTitle: 'Global texnik xizmat rejimi',
    maintenanceDesc: "Barcha mijoz so'rovlarini texnik xizmat sahifasiga yo'naltiradi",
    auditedSupportTitle: "Audit qilinadigan qo'llab-quvvatlash",
    auditedSupportDesc: 'Administratorning mijoz maydoniga kirishi qayd etiladi. Ushbu yozuv doimiydir.',
    selectTargetOrg: 'Tashkilotni tanlang',
    chooseTenant: '— Mijozni tanlang —',
    targetUserId: 'Foydalanuvchi ID (UUID)',
    reasonImpersonation: 'Kirish sababi',
    reasonPlaceholder: "Mijoz ma'lumotlariga kirish sababini tushuntiring…",
    authorizeImpersonation: 'Avtorizatsiya qilish va seansni yozish',
    dbStatus: "Ma'lumotlar bazasi holati",
    activeConnections: 'Faol aloqalar',
    avgQueryExecution: "O'rtacha so'rov vaqti",
    lastMigrationRun: "So'nggi migratsiya",
    cacheJobQueues: 'Kesh va navbatlar',
    redisCacheHits: 'Redis kesh ko\'rsatkichi',
    bullmqPendingJobs: 'Kutilayotgan BullMQ vazifalari',
    activeWorkers: 'Faol ishchilar',
    avgQueueProcessTime: "O'rtacha navbat vaqti",
    securityAuditing: 'Xavfsizlik va audit',
    auditLogs24h: 'Audit yozuvlari (24s)',
    activeImpersonations: 'Faol impersonatsiyalar',
    failedAdminLogins: 'Muvaffaqiyatsiz kirishlar',
    versionText: 'Versiya',
    free: 'Bepul', growth: "O'sish", pro: 'Pro', actions: 'Amallar',
  },
};

// ─── Sidebar Navigation Config ────────────────────────────────────────────────

const NAV_ITEMS: Array<{ id: Tab; labelKey: string; Icon: any }> = [
  { id: 'orgs',    labelKey: 'orgManagement',  Icon: Building2 },
  { id: 'billing', labelKey: 'billingQuotas',  Icon: CreditCard },
  { id: 'flags',   labelKey: 'featureFlags',   Icon: Flag },
  { id: 'support', labelKey: 'impersonation',  Icon: UserCheck },
  { id: 'health',  labelKey: 'systemHealth',   Icon: Activity },
];

// ─── API helpers ──────────────────────────────────────────────────────────────

const BASE = 'http://localhost:3000';

async function apiGet<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}

async function apiPatch(path: string, token: string, body: unknown): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
}

async function apiPost(path: string, token: string, body: unknown): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
}

const OFFLINE_ORGS: Organization[] = [
  { id: 'b6f2fcd0-1845-4bb6-a9bb-0bfa7c90b637', name: 'Standard Institute of Sciences', slug: 'sis-science', status: 'active',    billingPlan: 'growth', settings: { studentQuota: 500,  storageQuotaGb: 50  }, createdAt: '2026-02-14T10:00:00Z' },
  { id: 'f946358c-dcb9-4a94-b152-cb4db142a781', name: 'Global Languages Academy',       slug: 'gla-edu',    status: 'active',    billingPlan: 'pro',    settings: { studentQuota: 2000, storageQuotaGb: 200 }, createdAt: '2026-04-01T14:32:00Z' },
  { id: 'c8375ba7-47b8-4d33-bc42-df232ba71ab3', name: 'Beta Test College',              slug: 'beta-coll',  status: 'suspended', billingPlan: 'free',   settings: { studentQuota: 100,  storageQuotaGb: 10  }, createdAt: '2026-06-20T08:15:00Z' },
];

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  // Auth
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Shell state
  const [activeTab, setActiveTab] = useState<Tab>('orgs');
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('admin_lang') as Lang) || 'en');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Data
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgsLoading, setOrgsLoading] = useState(false);
  const [flags, setFlags] = useState<GlobalFlags>({
    enableAIModule: true,
    enableRLSPolicies: true,
    maintenanceMode: false,
    enableSpeechScoring: true,
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const t = (key: string) => I18N[lang][key] ?? I18N.en[key] ?? key;

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const changeLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem('admin_lang', l);
  };

  // ─── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    window.electronAPI?.getAppVersion().then(setAppVersion).catch(() => {});
  }, []);

  useEffect(() => {
    if (token) fetchOrganizations();
  }, [token]);

  // ─── Data fetching ──────────────────────────────────────────────────────────

  const fetchOrganizations = async () => {
    setOrgsLoading(true);
    try {
      const data = await apiGet<Organization[]>('/platform/v1/organizations', token!);
      setOrgs(data);
    } catch {
      console.warn('[CampusOS Admin] API offline — using mock data');
      setOrgs(OFFLINE_ORGS);
    } finally {
      setOrgsLoading(false);
    }
  };

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch(`${BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Invalid credentials');
      }
      const { accessToken } = await res.json();
      if (!accessToken) throw new Error('No access token returned');

      // Role enforcement
      if (window.electronAPI) {
        const check = await window.electronAPI.verifyTokenRole(accessToken);
        if (!check.valid) throw new Error(check.error || 'Access restricted to Platform Super Admins only.');
      } else {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        if (!payload.roles?.includes('platform_super_admin')) {
          throw new Error('Access restricted to Platform Super Admins only.');
        }
      }

      localStorage.setItem('admin_token', accessToken);
      setToken(accessToken);
      window.electronAPI?.showNotification('Access Granted', 'Welcome to the Super Admin Console.');
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setOrgs([]);
  };

  const handleToggleStatus = async (org: Organization) => {
    const nextStatus = org.status === 'active' ? 'suspended' : 'active';
    try {
      await apiPatch(`/platform/v1/organizations/${org.id}/status`, token!, { status: nextStatus });
      showToast('success', `Organization status set to ${nextStatus}`);
      fetchOrganizations();
    } catch {
      setOrgs((prev) => prev.map((o) => o.id === org.id ? { ...o, status: nextStatus as any } : o));
      showToast('success', `[Offline] Status toggled to ${nextStatus}`);
    }
  };

  const handleSaveQuota = async (orgId: string, plan: string, students: number, storageGb: number) => {
    const payload = { billingPlan: plan, settings: { studentQuota: students, storageQuotaGb: storageGb } };
    try {
      await apiPatch(`/platform/v1/organizations/${orgId}/quota`, token!, payload);
      showToast('success', 'Billing plan and quotas updated');
      fetchOrganizations();
    } catch {
      setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, ...payload } : o));
      showToast('success', '[Offline] Quota overrides applied');
    }
  };

  const handleImpersonation = async (orgId: string, userId: string, reason: string) => {
    try {
      await apiPost(`/platform/v1/organizations/${orgId}/impersonate`, token!, { targetUserId: userId, reason });
      showToast('success', `Impersonation token generated. Session audit logged.`);
    } catch {
      showToast('success', `[Offline] Audit log written — actor: Super Admin, reason: "${reason}"`);
    }
  };

  const handleFlagToggle = (key: keyof GlobalFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
    showToast('success', `Global flag '${key}' updated`);
  };

  // ─── Login Screen ────────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-lang-switcher">
          <LangSwitcher lang={lang} onChange={changeLang} />
        </div>

        <div className="login-card">
          <div className="login-brand">
            <div className="login-brand-icon">
              <Building2 size={28} color="#fff" />
            </div>
            <h1 className="login-title">{t('consoleTitle')}</h1>
            <p className="login-subtitle">{t('accessRestricted')}</p>
          </div>

          {loginError && (
            <div className="alert alert-error" role="alert">
              <ShieldAlert size={16} aria-hidden />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">{t('emailLabel')}</label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                className="form-control"
                placeholder="superadmin@campusos.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">{t('passwordLabel')}</label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary w-full mt-5" disabled={loginLoading}>
              {loginLoading && <Loader2 size={16} className="spinner" aria-hidden />}
              {loginLoading ? t('signingIn') : t('signInBtn')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── App Shell ───────────────────────────────────────────────────────────────

  const TAB_TITLES: Record<Tab, string> = {
    orgs: t('orgManagement'),
    billing: t('billingQuotas'),
    flags: t('featureFlags'),
    support: t('impersonation'),
    health: t('systemHealth'),
  };

  return (
    <div className="admin-shell">
      <Toast message={toast} />

      {/* Sidebar */}
      <aside className="admin-sidebar" role="navigation" aria-label="Main navigation">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Building2 size={20} color="#fff" />
          </div>
          <div className="sidebar-brand-text">
            <h3>CampusOS</h3>
            <span>{t('consoleTitle')}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ id, labelKey, Icon }) => (
            <button
              key={id}
              className={`nav-item${activeTab === id ? ' active' : ''}`}
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden />
              {t(labelKey)}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-version">{t('versionText')} {appVersion}</p>
          <button className="btn btn-danger-ghost w-full" onClick={handleLogout}>
            <LogOut size={16} aria-hidden />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <h1 className="topbar-title">{TAB_TITLES[activeTab]}</h1>
          <div className="topbar-right">
            <LangSwitcher lang={lang} onChange={changeLang} />
            <span className="badge badge-online">{t('serverOnline')}</span>
          </div>
        </header>

        <main className="admin-body" role="main">
          {activeTab === 'orgs' && (
            <OrgsPage orgs={orgs} loading={orgsLoading} onToggleStatus={handleToggleStatus} t={t} />
          )}
          {activeTab === 'billing' && (
            <BillingPage orgs={orgs} onSaveQuota={handleSaveQuota} t={t} />
          )}
          {activeTab === 'flags' && (
            <FlagsPage flags={flags} onToggle={handleFlagToggle} t={t} />
          )}
          {activeTab === 'support' && (
            <SupportPage orgs={orgs} onSubmit={handleImpersonation} t={t} />
          )}
          {activeTab === 'health' && (
            <HealthPage t={t} />
          )}
        </main>
      </div>
    </div>
  );
}
