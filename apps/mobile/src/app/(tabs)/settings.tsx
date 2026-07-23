import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Card } from '../../components/Card';
import { LogOut, User, Bell, Palette, Globe } from 'lucide-react-native';
import { useThemeStore } from '../../store/theme.store';
import { useAuthStore } from '../../store/auth.store';
import { useLanguageStore, Language } from '../../store/language.store';

export default function SettingsScreen() {
  const { primaryColor, setTheme } = useThemeStore();
  const { user, signOut } = useAuthStore();
  const { language, setLanguage, t } = useLanguageStore();

  const toggleTheme = () => {
    if (primaryColor === '#e11d48') {
      setTheme('#6366f1', '#4f46e5');
    } else {
      setTheme('#e11d48', '#be123c');
    }
  };

  const handleProfilePress = () => {
    Alert.alert(
      t('personalProfile'),
      `${t('profileAlertMsg')}\n\nName: ${user.name}\nEmail: ${user.email}\nRole Context: ${user.roleTitle}`,
      [{ text: 'OK' }]
    );
  };

  const handleNotificationsPress = () => {
    Alert.alert(
      t('notifications'),
      t('notifAlertMsg'),
      [{ text: 'OK' }]
    );
  };

  const handleSignOutPress = () => {
    Alert.alert(
      t('signOut'),
      t('signOutAlertMsg'),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('signOut'),
          style: 'destructive',
          onPress: () => {
            signOut();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileSection}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: `${primaryColor}20` }]}>
          <Text style={[styles.avatarText, { color: primaryColor }]}>{user.avatarText}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.roleTitle}>{user.roleTitle}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <Card style={styles.menuCard}>
        {/* Language Selector */}
        <View style={styles.languageBox}>
          <View style={styles.languageLabelRow}>
            <Globe size={18} color="#64748b" />
            <Text style={styles.languageLabel}>{t('language')}</Text>
          </View>
          <View style={styles.langButtonsRow}>
            {(['en', 'ru', 'uz'] as Language[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langBtn,
                  language === lang && { backgroundColor: primaryColor, borderColor: primaryColor },
                ]}
                onPress={() => setLanguage(lang)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.langBtnText,
                    language === lang && { color: '#ffffff', fontWeight: '700' },
                  ]}
                >
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Personal Profile Button */}
        <TouchableOpacity style={styles.menuItem} onPress={handleProfilePress} activeOpacity={0.6}>
          <User size={20} color="#64748b" />
          <Text style={styles.menuText}>{t('personalProfile')}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Notifications & Alerts Button */}
        <TouchableOpacity style={styles.menuItem} onPress={handleNotificationsPress} activeOpacity={0.6}>
          <Bell size={20} color="#64748b" />
          <Text style={styles.menuText}>{t('notifications')}</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* Theme Toggle Button */}
        <TouchableOpacity style={styles.menuItem} onPress={toggleTheme} activeOpacity={0.6}>
          <Palette size={20} color={primaryColor} />
          <Text style={[styles.menuText, { color: primaryColor, fontWeight: '600' }]}>
            {t('toggleTheme')}
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOutPress} activeOpacity={0.7}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>{t('signOut')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
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
    padding: 14,
    backgroundColor: '#f1f5f9',
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 4,
  },
  roleBtnText: {
    fontSize: 12,
    color: '#475569',
  },
  languageBox: {
    padding: 14,
    backgroundColor: '#ffffff',
  },
  languageLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  languageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  langButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuText: {
    fontSize: 14,
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
    marginTop: 16,
    marginBottom: 30,
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
    fontSize: 14,
  },
});
