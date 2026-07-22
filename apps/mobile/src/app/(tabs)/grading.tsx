import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Card } from '../../components/Card';
import { ClipboardList, Plus, CheckCircle2, Clock, Send, FileText } from 'lucide-react-native';
import { useThemeStore } from '../../store/theme.store';
import { useAuthStore } from '../../store/auth.store';

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  maxScore: number;
}

const mockAssignments: Assignment[] = [
  {
    id: 'a1',
    title: 'Assignment 3: Algorithm Analysis',
    course: 'CS301 Data Structures',
    dueDate: 'Tomorrow, 11:59 PM',
    totalSubmissions: 28,
    gradedSubmissions: 14,
    maxScore: 100,
  },
  {
    id: 'a2',
    title: 'Quiz 2: Database Normalization',
    course: 'CS304 Database Systems',
    dueDate: '25 Jul 2026',
    totalSubmissions: 32,
    gradedSubmissions: 32,
    maxScore: 50,
  },
  {
    id: 'a3',
    title: 'Final Project Architecture Specs',
    course: 'CS402 Software Engineering',
    dueDate: '01 Aug 2026',
    totalSubmissions: 18,
    gradedSubmissions: 2,
    maxScore: 200,
  },
];

export default function TeacherGradingScreen() {
  const primaryColor = useThemeStore((state: any) => state.primaryColor);
  const role = useAuthStore((state: any) => state.role);
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CS301 Data Structures');
  const [newMaxScore, setNewMaxScore] = useState('100');

  const handleCreateAssignment = () => {
    if (!newTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter an assignment title.');
      return;
    }
    const newAssn: Assignment = {
      id: `a${Date.now()}`,
      title: newTitle,
      course: newCourse,
      dueDate: 'In 7 days',
      totalSubmissions: 0,
      gradedSubmissions: 0,
      maxScore: parseInt(newMaxScore, 10) || 100,
    };
    setAssignments([newAssn, ...assignments]);
    setNewTitle('');
    setShowCreateModal(false);
    Alert.alert('Success', 'Assignment published to student portals!');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Assignments & Grading</Text>
          <Text style={styles.pageSubtitle}>
            {role === 'teacher' ? 'Manage & grade student submissions' : 'My Assigned Homework'}
          </Text>
        </View>
        {role === 'teacher' && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: primaryColor }]}
            onPress={() => setShowCreateModal(!showCreateModal)}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Assign</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* New Assignment Creation Form */}
      {showCreateModal && (
        <Card style={styles.createCard}>
          <Text style={styles.createTitle}>Create & Publish Assignment</Text>
          
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Midterm Lab Assignment"
            value={newTitle}
            onChangeText={setNewTitle}
          />

          <Text style={styles.label}>Course</Text>
          <TextInput
            style={styles.input}
            value={newCourse}
            onChangeText={setNewCourse}
          />

          <Text style={styles.label}>Max Score</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={newMaxScore}
            onChangeText={setNewMaxScore}
          />

          <TouchableOpacity
            style={[styles.publishButton, { backgroundColor: primaryColor }]}
            onPress={handleCreateAssignment}
          >
            <Send size={18} color="#ffffff" />
            <Text style={styles.publishText}>Publish to Students</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Assignment List */}
      <Text style={styles.sectionHeading}>Active Assignments</Text>
      {assignments.map((item) => {
        const isComplete = item.gradedSubmissions === item.totalSubmissions;
        const progressPct =
          item.totalSubmissions > 0
            ? Math.round((item.gradedSubmissions / item.totalSubmissions) * 100)
            : 0;

        return (
          <Card key={item.id} style={styles.assignmentCard}>
            <View style={styles.itemHeader}>
              <View style={[styles.iconBox, { backgroundColor: `${primaryColor}15` }]}>
                <ClipboardList size={22} color={primaryColor} />
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.courseText}>{item.course}</Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaBadge}>
                <Clock size={14} color="#64748b" />
                <Text style={styles.metaText}>Due: {item.dueDate}</Text>
              </View>
              <Text style={styles.scoreText}>Max Points: {item.maxScore}</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <Text style={styles.progressLabel}>
                  Graded: {item.gradedSubmissions}/{item.totalSubmissions} ({progressPct}%)
                </Text>
                {isComplete && (
                  <View style={styles.completeBadge}>
                    <CheckCircle2 size={14} color="#10b981" />
                    <Text style={styles.completeText}>All Graded</Text>
                  </View>
                )}
              </View>
              <View style={styles.progressBarTrack}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPct}%`,
                      backgroundColor: isComplete ? '#10b981' : primaryColor,
                    },
                  ]}
                />
              </View>
            </View>
          </Card>
        );
      })}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  createCard: {
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  createTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    marginBottom: 14,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  publishText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  assignmentCard: {
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  courseText: {
    fontSize: 13,
    color: '#64748b',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  progressBarTrack: {
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
