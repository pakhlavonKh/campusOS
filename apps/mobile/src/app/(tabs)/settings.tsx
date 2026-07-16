import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { LogOut, User, Bell, Shield, Palette } from 'lucide-react-native';
import { useThemeStore } from '../../store/theme.store';

export default function SettingsScreen() {
  const { primaryColor, setTheme } = useThemeStore();

  const toggleTheme = () => {
    if (primaryColor === '#e11d48') {
      setTheme('#6366f1', '#4f46e5');
    } else {
      setTheme('#e11d48', '#be123c');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: `${primaryColor}20` }]}>
          <Text style={[styles.avatarText, { color: primaryColor }]}>AS</Text>
        </View>
        <Text style={styles.name}>Alex Student</Text>
        <Text style={styles.email}>alex@student.edu</Text>
      </View>

      <Card style={styles.menuCard}>
        <TouchableOpacity style={styles.menuItem}>
          <User size={20} color="#64748b" />
          <Text style={styles.menuText}>Personal Information</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.menuItem}>
          <Bell size={20} color="#64748b" />
          <Text style={styles.menuText}>Notifications</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.menuItem}>
          <Shield size={20} color="#64748b" />
          <Text style={styles.menuText}>Privacy & Security</Text>
        </TouchableOpacity>

        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
          <Palette size={20} color={primaryColor} />
          <Text style={[styles.menuText, { color: primaryColor, fontWeight: '600' }]}>Toggle Theme Config</Text>
        </TouchableOpacity>
      </Card>

      <TouchableOpacity style={styles.logoutButton}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
    paddingTop: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748b',
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 20,
  },
  menuText: {
    fontSize: 16,
    color: '#334155',
    marginLeft: 16,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 56,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 24,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginLeft: 8,
  },
});
