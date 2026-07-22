import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../components/Card';
import { BookOpen, CheckCircle, Clock, Users, Award, FileSpreadsheet } from 'lucide-react-native';
import { useThemeStore } from '../../store/theme.store';
import { useAuthStore } from '../../store/auth.store';

export default function DashboardScreen() {
  const primaryColor = useThemeStore((state: any) => state.primaryColor);
  const { user, role } = useAuthStore();

  const isTeacher = role === 'teacher';

  const stats = isTeacher
    ? [
        { id: '1', title: 'Active Classes', value: '3', icon: BookOpen, color: primaryColor },
        { id: '2', title: 'To Grade', value: '14', icon: FileSpreadsheet, color: '#f59e0b' },
        { id: '3', title: 'Avg Attendance', value: '94%', icon: Users, color: '#10b981' },
      ]
    : [
        { id: '1', title: 'Active Courses', value: '4', icon: BookOpen, color: primaryColor },
        { id: '2', title: 'Assignments Due', value: '2', icon: Clock, color: '#f59e0b' },
        { id: '3', title: 'Completed', value: '12', icon: CheckCircle, color: '#10b981' },
      ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning,</Text>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.roleTitle}>{user.roleTitle}</Text>
      </View>

      <Text style={styles.sectionTitle}>
        {isTeacher ? 'Teacher Workspace Overview' : 'Student Overview'}
      </Text>

      <View style={styles.statsGrid}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.id} style={styles.statCard}>
              <View style={[styles.iconWrapper, { backgroundColor: `${stat.color}15` }]}>
                <Icon size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </Card>
          );
        })}
      </View>

      <Text style={styles.sectionTitle}>
        {isTeacher ? 'Pending Teacher Actions' : 'Recent Activity'}
      </Text>
      <Card>
        {isTeacher ? (
          <>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#f59e0b' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>14 submissions pending grading in CS301</Text>
                <Text style={styles.activityTime}>Due for review today</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: primaryColor }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Lecture 8 slides published to CS304</Text>
                <Text style={styles.activityTime}>Published 3 hours ago</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: primaryColor }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>Grade posted for Physics Midterm</Text>
                <Text style={styles.activityTime}>2 hours ago</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <View style={[styles.activityDot, { backgroundColor: '#f59e0b' }]} />
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>New announcement in History 101</Text>
                <Text style={styles.activityTime}>Yesterday</Text>
              </View>
            </View>
          </>
        )}
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
  statCard: {
    width: '30%',
    marginBottom: 16,
    alignItems: 'center',
    padding: 12,
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
