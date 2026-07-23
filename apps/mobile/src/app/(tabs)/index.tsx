import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../components/Card';
import { BookOpen, CheckCircle, Clock, Users, FileSpreadsheet, ShieldCheck, Heart, Award, FileText } from 'lucide-react-native';
import { useThemeStore } from '../../store/theme.store';
import { useAuthStore } from '../../store/auth.store';
import { useLanguageStore } from '../../store/language.store';

export default function DashboardScreen() {
  const primaryColor = useThemeStore((state: any) => state.primaryColor);
  const { user, role } = useAuthStore();
  const t = useLanguageStore((state: any) => state.t);

  const getRoleDashboardConfig = () => {
    switch (role) {
      case 'admin':
        return {
          sectionTitle: t('adminOverview'),
          pendingTitle: t('pendingAdminActions'),
          stats: [
            { id: '1', title: t('totalUsers'), value: '1,250', icon: Users, color: primaryColor },
            { id: '2', title: t('activeClasses'), value: '48', icon: BookOpen, color: '#f59e0b' },
            { id: '3', title: t('systemHealth'), value: '99.9%', icon: ShieldCheck, color: '#10b981' },
          ],
          activities: [
            { text: 'New branch teacher account approved (Prof. Wilson)', time: '10 min ago', color: '#10b981' },
            { text: 'Monthly audit report generated for campus leadership', time: '1 hour ago', color: primaryColor },
          ],
        };
      case 'teacher':
        return {
          sectionTitle: t('teacherOverview'),
          pendingTitle: t('pendingTeacherActions'),
          stats: [
            { id: '1', title: t('activeClasses'), value: '3', icon: BookOpen, color: primaryColor },
            { id: '2', title: t('toGrade'), value: '14', icon: FileSpreadsheet, color: '#f59e0b' },
            { id: '3', title: t('avgAttendance'), value: '94%', icon: Users, color: '#10b981' },
          ],
          activities: [
            { text: '14 submissions pending grading in CS301', time: 'Due for review today', color: '#f59e0b' },
            { text: 'Lecture 8 slides published to CS304', time: 'Published 3 hours ago', color: primaryColor },
          ],
        };
      case 'assistant_teacher':
        return {
          sectionTitle: t('assistantTeacherOverview'),
          pendingTitle: t('pendingAssistantActions'),
          stats: [
            { id: '1', title: 'Assigned Labs', value: '5', icon: BookOpen, color: primaryColor },
            { id: '2', title: 'Lab Quizzes to Grade', value: '8', icon: FileSpreadsheet, color: '#f59e0b' },
            { id: '3', title: 'Student Inquiries', value: '3', icon: Users, color: '#3b82f6' },
          ],
          activities: [
            { text: 'Physics 101 Lab 3 grading assistance requested by Dr. Chen', time: '30 min ago', color: '#f59e0b' },
            { text: 'Reviewed 4 lab report submissions for CS301', time: '2 hours ago', color: '#10b981' },
          ],
        };
      case 'student':
        return {
          sectionTitle: t('studentOverview'),
          pendingTitle: t('recentActivity'),
          stats: [
            { id: '1', title: t('activeCourses'), value: '4', icon: BookOpen, color: primaryColor },
            { id: '2', title: t('assignmentsDue'), value: '2', icon: Clock, color: '#f59e0b' },
            { id: '3', title: t('completed'), value: '12', icon: CheckCircle, color: '#10b981' },
          ],
          activities: [
            { text: 'Grade posted for Physics Midterm (Score: 92%)', time: '2 hours ago', color: primaryColor },
            { text: 'New announcement in History 101', time: 'Yesterday', color: '#f59e0b' },
          ],
        };
      case 'parent':
        return {
          sectionTitle: t('parentOverview'),
          pendingTitle: t('parentUpdates'),
          stats: [
            { id: '1', title: 'Child Attendance', value: '96%', icon: Heart, color: '#10b981' },
            { id: '2', title: 'Current GPA', value: '3.8', icon: Award, color: primaryColor },
            { id: '3', title: 'Active Courses', value: '4', icon: BookOpen, color: '#f59e0b' },
          ],
          activities: [
            { text: 'Alex completed CS301 Assignment 3 (Grade: A)', time: 'Yesterday', color: '#10b981' },
            { text: 'Attendance recorded: Present in Physics 101 Lecture', time: 'Today, 9:00 AM', color: primaryColor },
          ],
        };
    }
  };

  const config = getRoleDashboardConfig();

  const handleStatPress = (title: string, value: string) => {
    Alert.alert(title, `Current Metric Value: ${value}`);
  };

  const handleActivityPress = (activityText: string) => {
    Alert.alert('Activity Item', activityText);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{t('goodMorning')}</Text>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.roleTitle}>{user.roleTitle}</Text>
      </View>

      <Text style={styles.sectionTitle}>{config.sectionTitle}</Text>

      <View style={styles.statsGrid}>
        {config.stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <TouchableOpacity
              key={stat.id}
              style={styles.statCardWrapper}
              onPress={() => handleStatPress(stat.title, stat.value)}
              activeOpacity={0.7}
            >
              <Card style={styles.statCard}>
                <View style={[styles.iconWrapper, { backgroundColor: `${stat.color}15` }]}>
                  <Icon size={24} color={stat.color} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>{config.pendingTitle}</Text>
      <Card>
        {config.activities.map((act, index) => (
          <TouchableOpacity
            key={index}
            style={styles.activityItem}
            onPress={() => handleActivityPress(act.text)}
            activeOpacity={0.6}
          >
            <View style={[styles.activityDot, { backgroundColor: act.color }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>{act.text}</Text>
              <Text style={styles.activityTime}>{act.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </Card>
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
    paddingTop: 60,
  },
  header: {
    marginBottom: 28,
  },
  greeting: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 2,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  roleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCardWrapper: {
    width: '30%',
    marginBottom: 16,
  },
  statCard: {
    alignItems: 'center',
    padding: 12,
    marginBottom: 0,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
});
