import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../../components/Card';
import { BookOpen, CheckCircle, Clock } from 'lucide-react-native';
import { useThemeStore } from '../../store/theme.store';

export default function DashboardScreen() {
  const primaryColor = useThemeStore((state) => state.primaryColor);

  const stats = [
    { id: '1', title: 'Active Courses', value: '4', icon: BookOpen, color: primaryColor },
    { id: '2', title: 'Assignments Due', value: '2', icon: Clock, color: '#f59e0b' },
    { id: '3', title: 'Completed', value: '12', icon: CheckCircle, color: '#10b981' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning,</Text>
        <Text style={styles.name}>Alex Student</Text>
      </View>

      <Text style={styles.sectionTitle}>Overview</Text>
      
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

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <Card>
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: primaryColor }]} />
          <View>
            <Text style={styles.activityText}>Grade posted for Physics Midterm</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: '#f59e0b' }]} />
          <View>
            <Text style={styles.activityText}>New announcement in History 101</Text>
            <Text style={styles.activityTime}>Yesterday</Text>
          </View>
        </View>
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
    paddingTop: 60, // Adjust for status bar in a real app
  },
  header: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
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
    width: '47%',
    marginBottom: 16,
    alignItems: 'center',
    padding: 16,
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
});
