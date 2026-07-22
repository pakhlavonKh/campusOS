import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { LogOut, User, Bell, Shield, Palette, GraduationCap, School } from 'lucide-react-native';
import { useThemeStore } from '../../store/theme.store';
import { useAuthStore } from '../../store/auth.store';

export default function SettingsScreen() {
  const { primaryColor, setTheme } = useThemeStore();
  const { user, role, setRole } = useAuthStore();

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
          <Text style={[styles.avatarText, { color: primaryColor }]}>{user.avatarText}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.roleTitle}>{user.roleTitle}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <Card style={styles.menuCard}>
        {/* Role Switcher */}
        <View style={styles.roleBox}>
          <Text style={styles.roleLabel}>Active App Role Context:</Text>
          <View style={styles.roleButtonsRow}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === 'teacher' && { backgroundColor: primaryColor },
              ]}
              onPress={() => setRole('teacher')}
            >
              <School size={16} color={role === 'teacher' ? '#ffffff' : '#64748b'} />
              <Text
                style={[
                  styles.roleBtnText,
                  role === 'teacher' && { color: '#ffffff', fontWeight: '700' },
                ]}
              >
                Teacher Mode
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === 'student' && { backgroundColor: primaryColor },
              ]}
              onPress={() => setRole('student')}
            >
              <GraduationCap size={16} color={role === 'student' ? '#ffffff' : '#64748b'} />
              <Text
                style={[
                  styles.roleBtnText,
                  role === 'student' && { color: '#ffffff', fontWeight: '700' },
                ]}
              >
                Student Mode
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <User size={20} color="#64748b" />
          <Text style={styles.menuText}>Personal Profile</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem}>
          <Bell size={20} color="#64748b" />
          <Text style={styles.menuText}>Notifications & Alerts</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
          <Palette size={20} color={primaryColor} />
          <Text style={[styles.menuText, { color: primaryColor, fontWeight: '600' }]}>
            Toggle Brand Theme
          </Text>
        </TouchableOpacity>
      </Card>

      <TouchableOpacity style={styles.logoutButton}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
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
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: '#94a3b8',
  },
  menuCard: {
    padding: 0,
    overflow: 'hidden',
  },
  roleBox: {
    padding: 16,
    backgroundColor: '#f1f5f9',
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 6,
  },
  roleBtnText: {
    fontSize: 13,
    color: '#475569',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    fontSize: 15,
    color: '#1e293b',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    padding: 14,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
});
