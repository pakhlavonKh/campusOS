import React, { useState } from 'react';
import { Search, Settings, Plus, Paperclip, FileText, FileCode, Download as DownloadIcon, X, Send, ClipboardList } from 'lucide-react';

interface ContextFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'code' | 'doc' | 'data';
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

interface GradeEntry {
  studentId: string;
  assignmentId: string;
  score: number | null;
}

export function GradebookPage() {
  const [activeTab, setActiveTab] = useState<'assignments' | 'gradebook'>('assignments');
  const [assignments, setAssignments] = useState<WebAssignment[]>([]);
  const [students] = useState<Student[]>([]);
  const [grades] = useState<GradeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Teams Assignment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CS301 Data Structures');
  const [newMaxScore, setNewMaxScore] = useState('100');
  const [newInstructions, setNewInstructions] = useState('');
  const [newRubric, setNewRubric] = useState('Correctness (50%), Code Quality (50%)');
  const [attachedFiles, setAttachedFiles] = useState<ContextFile[]>([]);
  const [newFileName, setNewFileName] = useState('');

  const handleAddContextFile = () => {
    if (!newFileName.trim()) return;
    const ext = newFileName.split('.').pop()?.toLowerCase();
    let fileType: ContextFile['type'] = 'pdf';
    if (ext === 'py' || ext === 'ts' || ext === 'js' || ext === 'sql') fileType = 'code';
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
    setAttachedFiles(attachedFiles.filter((f: ContextFile) => f.id !== fileId));
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAssn: WebAssignment = {
      id: `a_${Date.now()}`,
      title: newTitle,
      course: newCourse,
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

      {/* TAB 1: Teams Assignments View */}
      {activeTab === 'assignments' && (
        filteredAssignments.length === 0 ? (
          <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No assignments created yet. Click <strong>+ Create Assignment</strong> to publish an assignment with context files!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filteredAssignments.map((assn: WebAssignment) => (
              <div key={assn.id} className="card" style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-400)', textTransform: 'uppercase' }}>
                      {assn.course}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginTop: '2px' }}>{assn.title}</h3>
                  </div>
                  <span className="badge badge-primary">Due: {assn.dueDate}</span>
                </div>

                {assn.instructions && (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                    {assn.instructions}
                  </p>
                )}

                {/* Context / Reference Materials Section */}
                {assn.contextFiles && assn.contextFiles.length > 0 && (
                  <div style={{ background: 'var(--bg-tertiary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Paperclip size={14} /> Reference Materials (Context Files Attached by Teacher):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {assn.contextFiles.map((file: ContextFile) => (
                        <div
                          key={file.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                          onClick={() => alert(`Downloading ${file.name} (${file.size})`)}
                        >
                          {file.type === 'code' ? <FileCode size={14} style={{ color: 'var(--color-primary-500)' }} /> : <FileText size={14} style={{ color: 'var(--color-primary-500)' }} />}
                          <span>{file.name}</span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>({file.size})</span>
                          <DownloadIcon size={12} style={{ marginLeft: '4px', color: 'var(--text-tertiary)' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: 'var(--text-tertiary)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-3)' }}>
                  <div>
                    <strong>Rubric:</strong> {assn.rubric}
                  </div>
                  <div>
                    Submissions: <strong style={{ color: 'var(--text-primary)' }}>{assn.gradedSubmissions}/{assn.totalSubmissions} Graded</strong> · Max Points: <strong>{assn.maxScore}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* TAB 2: Gradebook Matrix */}
      {activeTab === 'gradebook' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: '200px' }}>Student</th>
                  <th style={{ textAlign: 'center' }}>Overall Grade</th>
                  {assignments.map((a: WebAssignment) => (
                    <th key={a.id} style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                        Out of {a.maxScore}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={2 + assignments.length} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-tertiary)' }}>
                      No students found in gradebook.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student: Student) => {
                    const overall = calculateOverall(student.id);
                    return (
                      <tr key={student.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="avatar avatar-sm">{student.avatar}</div>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`badge ${
                              overall >= 90 ? 'badge-success' : overall >= 70 ? 'badge-info' : 'badge-danger'
                            }`}
                          >
                            {overall}%
                          </span>
                        </td>
                        {assignments.map((a: WebAssignment) => {
                          const score = getStudentGrade(student.id, a.id);
                          return (
                            <td key={a.id} style={{ textAlign: 'center', padding: '0' }}>
                              <input
                                type="number"
                                defaultValue={score !== null && score !== undefined ? score : ''}
                                style={{
                                  width: '60px',
                                  padding: 'var(--space-2)',
                                  background: 'transparent',
                                  border: '1px solid transparent',
                                  borderRadius: 'var(--radius-sm)',
                                  color: 'var(--text-primary)',
                                  textAlign: 'center',
                                }}
                                onFocus={(e) => (e.target.style.border = '1px solid var(--border-focus)')}
                                onBlur={(e) => (e.target.style.border = '1px solid transparent')}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Assignment Modal Overlay */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)',
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '580px', padding: 'var(--space-6)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>New Teams Assignment</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Assignment Title
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lab 4: Quantum Entanglement Simulation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Course
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Points / Max Score
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Instructions
                </label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '70px', resize: 'vertical' }}
                  placeholder="Detailed instructions for students..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Grading Rubric
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Correctness (50%), Code Quality (50%)"
                  value={newRubric}
                  onChange={(e) => setNewRubric(e.target.value)}
                />
              </div>

              {/* Context Files Attachment Section */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-primary-500)' }}>
                  📎 Attach Context / Reference Files (Microsoft Teams style)
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lecture_Slides.pdf"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="btn btn-secondary" onClick={handleAddContextFile} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Paperclip size={14} /> Attach File
                  </button>
                </div>

                {attachedFiles.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {attachedFiles.map((file: ContextFile) => (
                      <div
                        key={file.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          border: '1px solid var(--border-color)',
                        }}
                      >
                        <FileText size={14} style={{ color: 'var(--color-primary-500)' }} />
                        <span>{file.name}</span>
                        <button type="button" className="btn btn-ghost btn-icon" style={{ width: '20px', height: '20px' }} onClick={() => handleRemoveContextFile(file.id)}>
                          <X size={12} style={{ color: 'var(--color-danger-500)' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} /> Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
