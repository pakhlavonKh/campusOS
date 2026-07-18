import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'ru' | 'uz';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav / Sidebar
    dashboard: 'Dashboard',
    courses: 'Courses',
    attendance: 'Attendance',
    gradebook: 'Gradebook',
    messaging: 'Messaging',
    discussions: 'Discussions',
    users: 'Users',
    analytics: 'Analytics',
    settings: 'Settings',
    globalDashboard: 'Global Dashboard',
    organizations: 'Organizations',
    overview: 'Overview',
    academic: 'Academic',
    communication: 'Communication',
    system: 'System',
    superAdmin: 'Super Admin',
    logout: 'Logout',
    adminUser: 'Admin User',

    // Login
    welcomeBack: 'Welcome Back',
    loginSubtitle: 'Subject-Agnostic Education Operating System',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    signInBtn: 'Sign In',
    signingIn: 'Signing In...',
    heroTitle: 'CampusOS',
    heroSubtitle: 'The modern platform to orchestrate learning, attendance, grading, and collaboration.',

    // Dashboard
    totalStudents: 'Total Students',
    activeCourses: 'Active Courses',
    todaysAttendance: 'Today\'s Attendance',
    avgGrade: 'Avg. Grade',
    recentActivity: 'Recent Activity',
    upcomingSchedule: 'Upcoming Schedule',
    searchPlaceholder: 'Search anything...',
    inProgress: 'In Progress',
    upcoming: 'Upcoming',

    // Common / Table
    loading: 'Loading...',
    status: 'Status',
    actions: 'Actions',
    createdAt: 'Created At',
    active: 'Active',
    suspended: 'Suspended',
    archived: 'Archived',
  },
  ru: {
    // Nav / Sidebar
    dashboard: 'Панель управления',
    courses: 'Курсы',
    attendance: 'Посещаемость',
    gradebook: 'Журнал оценок',
    messaging: 'Сообщения',
    discussions: 'Обсуждения',
    users: 'Пользователи',
    analytics: 'Аналитика',
    settings: 'Настройки',
    globalDashboard: 'Глобальная панель',
    organizations: 'Организации',
    overview: 'Обзор',
    academic: 'Академический блок',
    communication: 'Общение',
    system: 'Система',
    superAdmin: 'Супер-админ',
    logout: 'Выйти',
    adminUser: 'Администратор',

    // Login
    welcomeBack: 'С возвращением',
    loginSubtitle: 'Предметно-независимая образовательная операционная система',
    emailLabel: 'Электронная почта',
    passwordLabel: 'Пароль',
    signInBtn: 'Войти в систему',
    signingIn: 'Вход...',
    heroTitle: 'CampusOS',
    heroSubtitle: 'Современная платформа для управления обучением, посещаемостью, оценками и совместной работой.',

    // Dashboard
    totalStudents: 'Всего студентов',
    activeCourses: 'Активные курсы',
    todaysAttendance: 'Посещаемость сегодня',
    avgGrade: 'Средний балл',
    recentActivity: 'Последние действия',
    upcomingSchedule: 'Ближайшее расписание',
    searchPlaceholder: 'Найти...',
    inProgress: 'В процессе',
    upcoming: 'Предстоит',

    // Common / Table
    loading: 'Загрузка...',
    status: 'Статус',
    actions: 'Действия',
    createdAt: 'Создано',
    active: 'Активен',
    suspended: 'Приостановлен',
    archived: 'В архиве',
  },
  uz: {
    // Nav / Sidebar
    dashboard: 'Boshqaruv paneli',
    courses: 'Kurslar',
    attendance: 'Davomat',
    gradebook: 'Baholar jurnali',
    messaging: 'Xabarlar',
    discussions: 'Muhokamalar',
    users: 'Foydalanuvchilar',
    analytics: 'Tahlillar',
    settings: 'Sozlamalar',
    globalDashboard: 'Global panel',
    organizations: 'Tashkilotlar',
    overview: 'Umumiy ko\'rinish',
    academic: 'Akademik bo\'lim',
    communication: 'Muloqot',
    system: 'Tizim',
    superAdmin: 'Super Admin',
    logout: 'Chiqish',
    adminUser: 'Administrator',

    // Login
    welcomeBack: 'Xush kelibsiz',
    loginSubtitle: 'Fanlardan mustaqil ta\'lim operatsion tizimi',
    emailLabel: 'Elektron qabul manzili',
    passwordLabel: 'Parol',
    signInBtn: 'Tizimga kirish',
    signingIn: 'Kirilmoqda...',
    heroTitle: 'CampusOS',
    heroSubtitle: 'O\'qitish, davomat, baholash va hamkorlikni boshqarish uchun zamonaviy platforma.',

    // Dashboard
    totalStudents: 'Jami talabalar',
    activeCourses: 'Faol kurslar',
    todaysAttendance: 'Bugungi davomat',
    avgGrade: 'O\'rtacha baho',
    recentActivity: 'So\'nggi faoliyat',
    upcomingSchedule: 'Yaqindagi dars jadvali',
    searchPlaceholder: 'Qidirish...',
    inProgress: 'Jarayonda',
    upcoming: 'Kutilayotgan',

    // Common / Table
    loading: 'Yuklanmoqda...',
    status: 'Holat',
    actions: 'Harakatlar',
    createdAt: 'Yaratilgan sana',
    active: 'Faol',
    suspended: 'To\'xtatilgan',
    archived: 'Arxivlangan',
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'en' || saved === 'ru' || saved === 'uz') {
      return saved as Language;
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  
  return (
    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', zIndex: 10 }}>
      <button 
        type="button"
        onClick={() => setLanguage('en')}
        style={{
          border: 'none',
          background: language === 'en' ? 'var(--color-primary-500)' : 'transparent',
          color: language === 'en' ? 'white' : 'var(--text-secondary)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        EN
      </button>
      <button 
        type="button"
        onClick={() => setLanguage('ru')}
        style={{
          border: 'none',
          background: language === 'ru' ? 'var(--color-primary-500)' : 'transparent',
          color: language === 'ru' ? 'white' : 'var(--text-secondary)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        RU
      </button>
      <button 
        type="button"
        onClick={() => setLanguage('uz')}
        style={{
          border: 'none',
          background: language === 'uz' ? 'var(--color-primary-500)' : 'transparent',
          color: language === 'uz' ? 'white' : 'var(--text-secondary)',
          padding: '4px 8px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        UZ
      </button>
    </div>
  );
};
