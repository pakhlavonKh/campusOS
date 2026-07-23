import { Tabs } from 'expo-router';
import { LayoutDashboard, BookOpen, ClipboardList, Settings } from 'lucide-react-native';
import { useThemeStore } from '../../store/theme.store';
import { useAuthStore } from '../../store/auth.store';
import { useLanguageStore } from '../../store/language.store';

export default function TabLayout() {
  const primaryColor = useThemeStore((state: any) => state.primaryColor);
  const role = useAuthStore((state: any) => state.role);
  const t = useLanguageStore((state: any) => state.t);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: '#f8fafc',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('dashboard'),
          headerShown: false,
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="grading"
        options={{
          title: role === 'teacher' ? t('grading') : t('assignments'),
          headerShown: false,
          tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="courses"
        options={{
          title: t('courses'),
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('settings'),
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
