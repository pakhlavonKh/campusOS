import { useState } from 'react';
import { Download, Search, Settings } from 'lucide-react';

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

const mockStudents: Student[] = [
  { id: '1', name: 'Alice Thompson', avatar: 'AT' },
  { id: '2', name: 'Benjamin Cruz', avatar: 'BC' },
  { id: '3', name: 'Chloe Park', avatar: 'CP' },
  { id: '4', name: 'Daniel Williams', avatar: 'DW' },
  { id: '5', name: 'Emma Rodriguez', avatar: 'ER' },
];

const mockAssignments = [
  { id: 'a1', name: 'HW 1', category: 'Homework', maxScore: 100 },
  { id: 'a2', name: 'HW 2', category: 'Homework', maxScore: 100 },
  { id: 'q1', name: 'Quiz 1', category: 'Quiz', maxScore: 50 },
  { id: 'e1', name: 'Midterm', category: 'Exam', maxScore: 200 },
];

const mockGrades: GradeEntry[] = [
  { studentId: '1', assignmentId: 'a1', score: 95 },
  { studentId: '1', assignmentId: 'a2', score: 88 },
  { studentId: '1', assignmentId: 'q1', score: 45 },
  { studentId: '1', assignmentId: 'e1', score: 180 },
  { studentId: '2', assignmentId: 'a1', score: 70 },
  { studentId: '2', assignmentId: 'a2', score: 75 },
  { studentId: '2', assignmentId: 'q1', score: 30 },
  { studentId: '2', assignmentId: 'e1', score: 140 },
];

export function GradebookPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const getStudentGrade = (studentId: string, assignmentId: string) => {
    return mockGrades.find(
      (g) => g.studentId === studentId && g.assignmentId === assignmentId
    )?.score;
  };

  const calculateOverall = (studentId: string) => {
    let earned = 0;
    let total = 0;
    mockAssignments.forEach((a) => {
      const score = getStudentGrade(studentId, a.id);
      if (score !== undefined && score !== null) {
        earned += score;
        total += a.maxScore;
      }
    });
    if (total === 0) return 0;
    return Math.round((earned / total) * 100);
  };

  const filteredStudents = mockStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Gradebook</h1>
          <p>Physics 101 - Fall 2026</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn btn-secondary">
            <Download size={16} /> Export
          </button>
          <button className="btn btn-primary">
            <Settings size={16} /> Categories
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div className="topbar-search" style={{ maxWidth: '400px' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: '200px' }}>Student</th>
                <th style={{ textAlign: 'center' }}>Overall Grade</th>
                {mockAssignments.map((a) => (
                  <th key={a.id} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                      Out of {a.maxScore}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
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
                    {mockAssignments.map((a) => {
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
