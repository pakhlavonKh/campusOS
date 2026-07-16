import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useThemeStore } from '../../store/theme.store';

interface Course {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  status: 'published' | 'draft';
  progress: number;
}

const mockCourses: Course[] = [
  { id: '1', title: 'Advanced Physics: Quantum Mechanics', subject: 'Physics', status: 'published', instructor: 'Dr. Sarah Chen', progress: 67 },
  { id: '2', title: 'Organic Chemistry Fundamentals', subject: 'Chemistry', status: 'published', instructor: 'Prof. James Wilson', progress: 45 },
  { id: '3', title: 'Data Structures & Algorithms', subject: 'Computer Science', status: 'published', instructor: 'Dr. Maya Patel', progress: 82 },
];

export default function CoursesScreen() {
  const primaryColor = useThemeStore((state) => state.primaryColor);

  const renderItem = ({ item }: { item: Course }) => (
    <Card style={styles.courseCard}>
      <View style={styles.cardHeader}>
        <Text style={[styles.subject, { color: primaryColor }]}>{item.subject}</Text>
        <Badge 
          label={item.status} 
          variant={item.status === 'published' ? 'success' : 'neutral'} 
        />
      </View>
      
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.instructor}>{item.instructor}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>{item.progress}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: primaryColor }]} />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={mockCourses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    padding: 20,
    paddingTop: 24,
  },
  courseCard: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subject: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 6,
    lineHeight: 24,
  },
  instructor: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});
