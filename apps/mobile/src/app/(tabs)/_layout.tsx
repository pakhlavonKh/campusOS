import { Tabs } from 'expo-router';
import { LayoutDashboard, BookOpen, Settings } from 'lucide-react-native';
import { useThemeStore } from '../../store/theme.store';

export default function TabLayout() {
  const primaryColor = useThemeStore((state) => state.primaryColor);

  return (
    <Tabs 
      screenOptions={{ 
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
          elevation: 0, // Remove shadow on Android
          shadowOpacity: 0, // Remove shadow on iOS
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
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: false, // Custom header in the screen itself
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
