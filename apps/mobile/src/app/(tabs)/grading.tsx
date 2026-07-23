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
import { ClipboardList, Plus, CheckCircle2, Clock, Send, Award, Paperclip, FileText, Download, X, FileCode } from 'lucide-react-native';
import { useThemeStore } from '../../store/theme.store';
import { useAuthStore } from '../../store/auth.store';
import { useLanguageStore } from '../../store/language.store';

interface ContextFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'code' | 'doc' | 'data';
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  maxScore: number;
  childScore?: number;
  instructions?: string;
  rubric?: string;
  contextFiles: ContextFile[];
}

export default function GradingScreen() {
  const primaryColor = useThemeStore((state: any) => state.primaryColor);
  const role = useAuthStore((state: any) => state.role);
  const t = useLanguageStore((state: any) => state.t);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Assignment Form State (Teams style)
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CS301 Data Structures');
  const [newMaxScore, setNewMaxScore] = useState('100');
  const [newInstructions, setNewInstructions] = useState('');
  const [newRubric, setNewRubric] = useState('Code Quality (50%), Correctness (50%)');
  const [attachedFiles, setAttachedFiles] = useState<ContextFile[]>([]);
  const [newFileName, setNewFileName] = useState('');

  const canCreateAssignment = role === 'admin' || role === 'teacher';
  const canGradeSubmissions = role === 'admin' || role === 'teacher' || role === 'assistant_teacher';

  const handleAddContextFile = () => {
    if (!newFileName.trim()) {
      Alert.alert('File Name Required', 'Please enter a reference file name to attach (e.g. Lecture_Notes.pdf)');
      return;
    }
    const ext = newFileName.split('.').pop()?.toLowerCase();
    let fileType: ContextFile['type'] = 'pdf';
    if (ext === 'py' || ext === 'ts' || ext === 'js' || ext === 'sql' || ext === 'cpp') fileType = 'code';
    if (ext === 'doc' || ext === 'docx' || ext === 'txt') fileType = 'doc';
    if (ext === 'csv' || ext === 'json' || ext === 'xlsx') fileType = 'data';

    const newFile: ContextFile = {
      id: `file_${Date.now()}`,
      name: newFileName.trim(),
      size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
      type: fileType,
    };
    setAttachedFiles([...attachedFiles, newFile]);
    setNewFileName('');
  };

  const handleRemoveContextFile = (fileId: string) => {
    setAttachedFiles(attachedFiles.filter((f) => f.id !== fileId));
  };

  const handleCreateAssignment = () => {
    if (!newTitle.trim()) {
      Alert.alert('Validation Error', 'Please enter an assignment title.');
      return;
    }
    const newAssn: Assignment = {
      id: `a${Date.now()}`,
      title: newTitle,
      course: newCourse,
      dueDate: 'In 7 days, 11:59 PM',
      totalSubmissions: 0,
      gradedSubmissions: 0,
      maxScore: parseInt(newMaxScore, 10) || 100,
      instructions: newInstructions || 'Follow attached context reference materials.',
      rubric: newRubric,
      contextFiles: attachedFiles,
    };

    setAssignments([newAssn, ...assignments]);
    setNewTitle('');
    setNewInstructions('');
    setAttachedFiles([]);
    setShowCreateModal(false);
    Alert.alert('Teams Assignment Created', 'Assignment & context reference files published successfully!');
  };

  const handleOpenFile = (file: ContextFile) => {
    Alert.alert('Opening Context File', `Loading ${file.name} (${file.size}) in mobile document viewer...`);
  };

  const handleAssignmentPress = (item: Assignment) => {
    if (role === 'parent') {
      Alert.alert(
        item.title,
        `Child: Alex Student\nCourse: ${item.course}\nScore: ${item.childScore || 0}/${item.maxScore}\n\nReference Files Attached: ${item.contextFiles.length} file(s)`,
        [{ text: 'Close' }]
      );
      return;
    }

    Alert.alert(
      item.title,
      `Course: ${item.course}\nInstructions: ${item.instructions || 'N/A'}\nRubric: ${item.rubric || 'N/A'}\nAttached Files: ${item.contextFiles.map(f => f.name).join(', ') || 'None'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        canGradeSubmissions
          ? {
              text: 'Grade Submissions',
              onPress: () => {
                const updated = assignments.map((a) =>
                  a.id === item.id ? { ...a, gradedSubmissions: Math.min(a.totalSubmissions, a.gradedSubmissions + 1) } : a
                );
                setAssignments(updated);
                Alert.alert('Grading Updated', '1 submission marked as graded!');
              },
            }
          : { text: 'Submit Homework', onPress: () => Alert.alert('Submitted', 'Homework uploaded successfully!') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.pageTitle}>
            {role === 'teacher' ? t('grading') : role === 'admin' ? 'Branch Academic Assignments' : 'Assignments'}
          </Text>
          <Text style={styles.pageSubtitle}>Microsoft Teams-style Assignment Management</Text>
        </View>
        {canCreateAssignment && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: primaryColor }]}
            onPress={() => setShowCreateModal(!showCreateModal)}
            activeOpacity={0.7}
          >
            <Plus size={18} color="#ffffff" />
            <Text style={styles.addButtonText}>Create</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Teams-Style Assignment Creation Form */}
      {showCreateModal && canCreateAssignment && (
        <Card style={styles.createCard}>
          <Text style={styles.createTitle}>New Teams Assignment</Text>
          
          <Text style={styles.label}>{t('title')}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Lab 4: Quantum Entanglement Simulation"
            value={newTitle}
            onChangeText={setNewTitle}
          />

          <Text style={styles.label}>{t('course')}</Text>
          <TextInput
            style={styles.input}
            value={newCourse}
            onChangeText={setNewCourse}
          />

          <Text style={styles.label}>Instructions</Text>
          <TextInput
            style={[styles.input, { height: 70 }]}
            multiline
            placeholder="Detailed instructions for students..."
            value={newInstructions}
            onChangeText={setNewInstructions}
          />

          <Text style={styles.label}>Grading Rubric / Criteria</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Correctness (40%), Efficiency (30%), Quality (30%)"
            value={newRubric}
            onChangeText={setNewRubric}
          />

          <Text style={styles.label}>{t('maxScore')}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={newMaxScore}
            onChangeText={setNewMaxScore}
          />

          {/* Context / Reference Files Section */}
          <Text style={[styles.label, { color: primaryColor, marginTop: 4 }]}>
            📎 Attach Reference / Context Files
          </Text>
          <View style={styles.fileAddRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="e.g. Lecture_Slides.pdf"
              value={newFileName}
              onChangeText={setNewFileName}
            />
            <TouchableOpacity
              style={[styles.attachBtn, { backgroundColor: primaryColor }]}
              onPress={handleAddContextFile}
              activeOpacity={0.7}
            >
              <Paperclip size={16} color="#ffffff" />
              <Text style={styles.attachBtnText}>Attach</Text>
            </TouchableOpacity>
          </View>

          {attachedFiles.length > 0 && (
            <View style={styles.fileListContainer}>
              {attachedFiles.map((file) => (
                <View key={file.id} style={styles.fileChip}>
                  <FileText size={14} color="#64748b" />
                  <Text style={styles.fileChipName} numberOfLines={1}>{file.name}</Text>
                  <TouchableOpacity onPress={() => handleRemoveContextFile(file.id)}>
                    <X size={14} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.publishButton, { backgroundColor: primaryColor }]}
            onPress={handleCreateAssignment}
            activeOpacity={0.7}
          >
            <Send size={18} color="#ffffff" />
            <Text style={styles.publishText}>{t('publishToStudents')}</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Assignment List */}
      <Text style={styles.sectionHeading}>{t('assignments')}</Text>
      {assignments.length === 0 ? (
        <Card style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center' }}>
            No assignments found. Tap + Create to publish an assignment!
          </Text>
        </Card>
      ) : (
        assignments.map((item) => {
          const isComplete = item.totalSubmissions > 0 && item.gradedSubmissions === item.totalSubmissions;
          const progressPct =
            item.totalSubmissions > 0
              ? Math.round((item.gradedSubmissions / item.totalSubmissions) * 100)
              : 0;

          return (
            <TouchableOpacity key={item.id} onPress={() => handleAssignmentPress(item)} activeOpacity={0.7}>
              <Card style={styles.assignmentCard}>
                <View style={styles.itemHeader}>
                  <View style={[styles.iconBox, { backgroundColor: `${primaryColor}15` }]}>
                    {role === 'parent' ? (
                      <Award size={22} color={primaryColor} />
                    ) : (
                      <ClipboardList size={22} color={primaryColor} />
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.titleText}>{item.title}</Text>
                    <Text style={styles.courseText}>{item.course}</Text>
                  </View>
                </View>

                {item.instructions ? (
                  <Text style={styles.instructionsText} numberOfLines={2}>
                    {item.instructions}
                  </Text>
                ) : null}

                {/* Attached Context Files Pills */}
                {item.contextFiles && item.contextFiles.length > 0 && (
                  <View style={styles.contextFilesBox}>
                    <Text style={styles.contextFilesHeader}>Reference Materials (Context Files):</Text>
                    <View style={styles.contextFilesRow}>
                      {item.contextFiles.map((file) => (
                        <TouchableOpacity
                          key={file.id}
                          style={styles.contextFilePill}
                          onPress={() => handleOpenFile(file)}
                          activeOpacity={0.7}
                        >
                          {file.type === 'code' ? (
                            <FileCode size={14} color={primaryColor} />
                          ) : (
                            <FileText size={14} color={primaryColor} />
                          )}
                          <Text style={styles.contextFileName} numberOfLines={1}>
                            {file.name}
                          </Text>
                          <Download size={12} color="#64748b" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.metaRow}>
                  <View style={styles.metaBadge}>
                    <Clock size={14} color="#64748b" />
                    <Text style={styles.metaText}>Due: {item.dueDate}</Text>
                  </View>
                  {role === 'parent' ? (
                    <Text style={[styles.scoreText, { color: primaryColor }]}>
                      Child Score: {item.childScore || 0}/{item.maxScore}
                    </Text>
                  ) : (
                    <Text style={styles.scoreText}>{t('maxScore')}: {item.maxScore}</Text>
                  )}
                </View>

                {role !== 'parent' && (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTextRow}>
                      <Text style={styles.progressLabel}>
                        {t('graded')}: {item.gradedSubmissions}/{item.totalSubmissions} ({progressPct}%)
                      </Text>
                      {isComplete && (
                        <View style={styles.completeBadge}>
                          <CheckCircle2 size={14} color="#10b981" />
                          <Text style={styles.completeText}>{t('allGraded')}</Text>
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
                )}
              </Card>
            </TouchableOpacity>
          );
        })
      )}
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
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
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
  fileAddRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  attachBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  fileListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  fileChipName: {
    fontSize: 12,
    color: '#334155',
    maxWidth: 160,
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
    marginBottom: 10,
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
  instructionsText: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 18,
  },
  contextFilesBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  contextFilesHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  contextFilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contextFilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  contextFileName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    maxWidth: 160,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
