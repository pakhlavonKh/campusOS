import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { useThemeStore } from '../../store/theme.store';
import { useLanguageStore } from '../../store/language.store';

interface Course {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  status: 'published' | 'draft';
  progress: number;
}

export default function CoursesScreen() {
  const primaryColor = useThemeStore((state: any) => state.primaryColor);
  const t = useLanguageStore((state: any) => state.t);
  const [courses] = useState<Course[]>([]);

  const handleCoursePress = (course: Course) => {
    Alert.alert(
      course.title,
      `${t('courseDetails')}:\nSubject: ${course.subject}\nInstructor: ${course.instructor}\nProgress: ${course.progress}%`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: t('viewLessons'), onPress: () => Alert.alert('Syllabus Loaded', `Opening curriculum modules for ${course.subject}`) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Course }) => (
    <TouchableOpacity onPress={() => handleCoursePress(item)} activeOpacity={0.7}>
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
            <Text style={styles.progressLabel}>{t('completed')}</Text>
            <Text style={styles.progressValue}>{item.progress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${item.progress}%`, backgroundColor: primaryColor }]} />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {courses.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No active course enrollments found.</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
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
