import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, Plus, FileText, FileCode, X, ClipboardList, UploadCloud } from 'lucide-react';
import { coursesService, Course } from '../../api/services/courses.service';
import { GradeEntry } from '../../api/services/gradebook.service';
import { storageService } from '../../api/services/storage.service';

interface ContextFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'code' | 'doc' | 'data';
  url?: string;
}

interface WebAssignment {
  id: string;
  title: string;
  course: string;
  category: string;
  dueDate: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  maxScore: number;
  instructions: string;
  rubric: string;
  contextFiles: ContextFile[];
}

interface Student {
  id: string;
  name: string;
  avatar: string;
}

export function GradebookPage() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'gradebook'>('assignments');
  const [assignments, setAssignments] = useState<WebAssignment[]>([]);
  const [students] = useState<Student[]>([]);
  const [grades] = useState<GradeEntry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Teams Assignment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [newMaxScore, setNewMaxScore] = useState('100');
  const [newInstructions, setNewInstructions] = useState('');
  const [newRubric, setNewRubric] = useState('Correctness (50%), Code Quality (50%)');
  const [attachedFiles, setAttachedFiles] = useState<ContextFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await coursesService.getCourses('default-org');
        if (res.success && res.data) {
          setCourses(res.data);
          if (res.data.length > 0) {
            setNewCourse(res.data[0].title);
          }
        }
      } catch (err) {
        console.warn('Backend service offline or returning empty. Displaying clean view.', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const determineFileType = (fileName: string): ContextFile['type'] => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['py', 'ts', 'js', 'sql', 'cpp', 'java', 'html', 'css', 'json'].includes(ext || '')) return 'code';
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) return 'doc';
    if (['csv', 'xlsx', 'xls'].includes(ext || '')) return 'data';
    return 'pdf';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newAttachments: ContextFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let fileUrl: string | undefined;

      try {
        const uploadRes = await storageService.uploadFile(file);
        if (uploadRes.success && uploadRes.data?.url) {
          fileUrl = uploadRes.data.url;
        }
      } catch (err) {
        console.warn('Direct backend upload fallback (using browser file metadata).', err);
      }

      newAttachments.push({
        id: `file_${Date.now()}_${i}`,
        name: file.name,
        size: formatFileSize(file.size),
        type: determineFileType(file.name),
        url: fileUrl,
      });
    }

    setAttachedFiles((prev: ContextFile[]) => [...prev, ...newAttachments]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveContextFile = (fileId: string) => {
    setAttachedFiles(attachedFiles.filter((f: ContextFile) => f.id !== fileId));
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAssn: WebAssignment = {
      id: `a_${Date.now()}`,
      title: newTitle,
      course: newCourse || 'CS301 Data Structures',
      category: 'Homework',
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
  };

  const getStudentGrade = (studentId: string, assignmentId: string) => {
    return grades.find(
      (g: GradeEntry) => g.studentId === studentId && g.assignmentId === assignmentId
    )?.score;
  };

  const calculateOverall = (studentId: string) => {
    let earned = 0;
    let total = 0;
    assignments.forEach((a: WebAssignment) => {
      const score = getStudentGrade(studentId, a.id);
      if (score !== undefined && score !== null) {
        earned += score;
        total += a.maxScore;
      }
    });
    if (total === 0) return 0;
    return Math.round((earned / total) * 100);
  };

  const filteredStudents = students.filter((s: Student) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssignments = assignments.filter((a: WebAssignment) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="page-header-left">
          <h1>Assignments & Gradebook</h1>
          <p>Microsoft Teams-style Assignment Creation with Context Reference Files</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create Assignment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--border-color)', marginBottom: 'var(--space-6)' }}>
        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'assignments' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
            color: activeTab === 'assignments' ? 'var(--color-primary-500)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'assignments' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <ClipboardList size={18} /> Teams Assignments
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('gradebook')}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'gradebook' ? '2px solid var(--color-primary-500)' : '2px solid transparent',
            color: activeTab === 'gradebook' ? 'var(--color-primary-500)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'gradebook' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Settings size={18} /> Gradebook Matrix
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div className="topbar-search" style={{ maxWidth: '400px' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            placeholder={activeTab === 'assignments' ? "Search assignments..." : "Search students..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading live data from backend...
        </div>
      ) : (
        <>
          {/* TAB 1: Teams Assignments View */}
          {activeTab === 'assignments' && (
            filteredAssignments.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <ClipboardList size={36} style={{ marginBottom: 'var(--space-3)', opacity: 0.5 }} />
                <p>No assignments found. Click "Create Assignment" to publish a new assignment.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
                {filteredAssignments.map((assn: WebAssignment) => (
                  <div key={assn.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                        <span className="badge badge-info">{assn.course}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Due: {assn.dueDate}</span>
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>{assn.title}</h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineClamp: 2 }}>
                        {assn.instructions}
                      </p>

                      {/* Attached Files Badge List */}
                      {assn.contextFiles.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                            ATTACHED REFERENCE CONTEXT ({assn.contextFiles.length})
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                            {assn.contextFiles.map((file: ContextFile) => (
                              <span
                                key={file.id}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 8px',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: 'var(--bg-tertiary)',
                                  fontSize: '0.75rem',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {file.type === 'code' ? <FileCode size={12} /> : <FileText size={12} />}
                                {file.name} ({file.size})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {assn.gradedSubmissions} / {assn.totalSubmissions} Graded
                      </span>
                      <button className="btn btn-secondary btn-sm">View Submissions</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: Gradebook Matrix */}
          {activeTab === 'gradebook' && (
            students.length === 0 ? (
              <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <Settings size={36} style={{ marginBottom: 'var(--space-3)', opacity: 0.5 }} />
                <p>No enrolled students found for the gradebook matrix.</p>
              </div>
            ) : (
              <div className="card" style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      {assignments.map((a: WebAssignment) => (
                        <th key={a.id} style={{ textAlign: 'center' }}>
                          <div>{a.title}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Max: {a.maxScore}</div>
                        </th>
                      ))}
                      <th style={{ textAlign: 'right' }}>Overall Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s: Student) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.8125rem' }}>
                              {s.avatar}
                            </div>
                            <span style={{ fontWeight: 500 }}>{s.name}</span>
                          </div>
                        </td>
                        {assignments.map((a: WebAssignment) => {
                          const score = getStudentGrade(s.id, a.id);
                          return (
                            <td key={a.id} style={{ textAlign: 'center' }}>
                              {score !== undefined && score !== null ? (
                                <span style={{ fontWeight: 600 }}>{score}</span>
                              ) : (
                                <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                              )}
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {calculateOverall(s.id)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}

      {/* Modal: Create Microsoft Teams-style Assignment */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 'var(--space-6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Create New Teams Assignment</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment}>
              <div className="form-group">
                <label className="form-label">Assignment Title</label>
                <input
                  className="form-input"
                  placeholder="e.g., Problem Set 4: Binary Search Trees"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Course</label>
                  <select
                    className="form-input"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                  >
                    {courses.length > 0 ? (
                      courses.map((c: Course) => (
                        <option key={c.id} value={c.title}>
                          {c.title}
                        </option>
                      ))
                    ) : (
                      <option value="CS301 Data Structures">CS301 Data Structures</option>
                    )}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Max Score</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instructions</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Provide detailed submission instructions..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grading Rubric Criteria</label>
                <input
                  className="form-input"
                  value={newRubric}
                  onChange={(e) => setNewRubric(e.target.value)}
                />
              </div>

              {/* Context Files Attachment Section with Native File Picker */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
                <label className="form-label">Attach Reference Context Files</label>

                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  onChange={handleFileSelect}
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-6)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-tertiary)',
                    marginBottom: 'var(--space-3)',
                    transition: 'border-color 0.2s ease',
                  }}
                >
                  <UploadCloud size={32} style={{ color: 'var(--color-primary-500)', marginBottom: 'var(--space-2)' }} />
                  <div style={{ fontWeight: 500, fontSize: '0.9375rem' }}>
                    {uploading ? 'Processing & Uploading Files...' : 'Click to Browse Files or Drag & Drop'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    Supports PDF, Word, Excel, Code files, and Images (up to 10MB)
                  </div>
                </div>

                {attachedFiles.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {attachedFiles.map((file: ContextFile) => (
                      <div
                        key={file.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: 'var(--space-2) var(--space-3)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-tertiary)',
                          fontSize: '0.875rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          {file.type === 'code' ? <FileCode size={16} /> : <FileText size={16} />}
                          <span>{file.name}</span>
                          <span style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>({file.size})</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon"
                          onClick={() => handleRemoveContextFile(file.id)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
