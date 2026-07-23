import { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Play,
  Shield,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  EyeOff,
  BarChart2,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface Assessment {
  id: string;
  title: string;
  course: string;
  timeLimitMinutes: number;
  questionCount: number;
  status: 'published' | 'draft';
  dueDate: string;
  antiCheatEnabled: boolean;
  passRate?: string;
  submissionsCount?: number;
}

interface Question {
  id: string;
  type: 'mcq' | 'tf' | 'short';
  prompt: string;
  options?: string[];
  correctIndex?: number;
  points: number;
}

const MOCK_ASSESSMENTS: Assessment[] = [
  { id: 'a1', title: 'Midterm Exam — Data Structures & Trees', course: 'CS301', timeLimitMinutes: 30, questionCount: 5, status: 'published', dueDate: '2026-08-01', antiCheatEnabled: true, passRate: '88%', submissionsCount: 24 },
  { id: 'a2', title: 'Physics Quiz 2 — Kinematics', course: 'PHYS101', timeLimitMinutes: 15, questionCount: 3, status: 'published', dueDate: '2026-08-05', antiCheatEnabled: true, passRate: '75%', submissionsCount: 18 },
  { id: 'a3', title: 'Calculus Final Assessment', course: 'MATH202', timeLimitMinutes: 45, questionCount: 10, status: 'draft', dueDate: '2026-08-15', antiCheatEnabled: false },
];

const MOCK_QUESTIONS: Question[] = [
  { id: 'q1', type: 'mcq', prompt: 'What is the worst-case time complexity of inserting an element into a Binary Search Tree (BST)?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correctIndex: 2, points: 20 },
  { id: 'q2', type: 'tf', prompt: 'A hash table with open addressing guarantees O(1) worst-case time complexity for search operations.', options: ['True', 'False'], correctIndex: 1, points: 20 },
  { id: 'q3', type: 'mcq', prompt: 'Which graph traversal algorithm uses a First-In-First-Out (FIFO) queue data structure?', options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra Algorithm', 'Kruskal Algorithm'], correctIndex: 1, points: 20 },
  { id: 'q4', type: 'short', prompt: 'Name the data structure primarily used to implement function call recursion call stacks.', points: 20 },
  { id: 'q5', type: 'mcq', prompt: 'What is the time complexity of building a heap (Heapify) from an unordered array of n elements?', options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'], correctIndex: 0, points: 20 },
];

export function AssessmentPage() {
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (activeMembership?.role || user?.role || user?.roles?.[0] || 'student').toLowerCase();
  const isTeacherOrAdmin = ['teacher', 'assistant_teacher', 'org_admin', 'branch_admin', 'super_admin'].includes(userRole);

  const [assessments, setAssessments] = useState<Assessment[]>(MOCK_ASSESSMENTS);
  const [activeTest, setActiveTest] = useState<Assessment | null>(null);

  // Test Taking State
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [antiCheatAlert, setAntiCheatAlert] = useState(false);
  const [testResult, setTestResult] = useState<{ score: number; maxScore: number; passed: boolean } | null>(null);

  // Quiz Creator State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('CS301');
  const [newTime, setNewTime] = useState(20);

  // Anti-Cheat Monitoring Effect (SRS §5.11)
  useEffect(() => {
    if (!activeTest || testResult) return;

    const handleVisibilityChange = () => {
      if (document.hidden && activeTest.antiCheatEnabled) {
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setAntiCheatAlert(true);
          setTimeout(() => setAntiCheatAlert(false), 4000);
          return next;
        });
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    return () => window.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeTest, testResult]);

  // Countdown Timer Effect
  useEffect(() => {
    if (!activeTest || testResult || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => setTimeLeftSeconds((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [activeTest, testResult, timeLeftSeconds]);

  const handleStartTest = (test: Assessment) => {
    setActiveTest(test);
    setTimeLeftSeconds(test.timeLimitMinutes * 60);
    setTabSwitchCount(0);
    setUserAnswers({});
    setTestResult(null);
    setCurrentQIndex(0);
  };

  const handleSelectAnswer = (qId: string, answerVal: any) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: answerVal }));
  };

  const handleSubmitTest = () => {
    let earned = 0;
    let total = 0;

    MOCK_QUESTIONS.forEach((q) => {
      total += q.points;
      const ans = userAnswers[q.id];
      if (q.type === 'mcq' || q.type === 'tf') {
        if (ans === q.correctIndex) earned += q.points;
      } else if (q.type === 'short') {
        if (ans && ans.toLowerCase().includes('stack')) earned += q.points;
      }
    });

    const passed = earned / total >= 0.7;
    setTestResult({ score: earned, maxScore: total, passed });
  };

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAssessments([
      { id: `a${Date.now()}`, title: newTitle, course: newCourse, timeLimitMinutes: newTime, questionCount: 5, status: 'published', dueDate: '2026-08-20', antiCheatEnabled: true, passRate: '100%', submissionsCount: 0 },
      ...assessments,
    ]);
    setNewTitle(''); setShowCreateModal(false);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Assessment Engine & Quizzes</h1>
          <p>{isTeacherOrAdmin ? 'Create, publish, and review automated quizzes with anti-cheat monitoring' : 'Complete course quizzes and track exam scores'}</p>
        </div>
        {isTeacherOrAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={16} /> Create Assessment</button>
        )}
      </div>

      {/* Anti-Cheat Toast Alert */}
      {antiCheatAlert && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, background: 'var(--color-danger-500)', color: '#fff', padding: '12px 18px', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={20} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Anti-Cheat Warning!</div>
            <div style={{ fontSize: 12 }}>Tab switch detected ({tabSwitchCount} times). Event logged.</div>
          </div>
        </div>
      )}

      {/* List of Assessments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
        {assessments.map((a) => (
          <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <span className="badge badge-info">{a.course}</span>
                <span className={`badge ${a.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>{a.status}</span>
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 'var(--space-2)' }}>{a.title}</h3>
              <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={13} /> {a.timeLimitMinutes} mins</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FileText size={13} /> {a.questionCount} Questions</span>
                {a.antiCheatEnabled && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-warning-500)' }}><Shield size={13} /> Anti-Cheat</span>}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)' }}>
              {isTeacherOrAdmin ? (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  Pass Rate: <strong style={{ color: 'var(--color-success-600)' }}>{a.passRate || '—'}</strong> ({a.submissionsCount || 0} subs)
                </div>
              ) : (
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Due {a.dueDate}</div>
              )}
              {!isTeacherOrAdmin && (
                <button className="btn btn-primary btn-sm" onClick={() => handleStartTest(a)}>
                  <Play size={14} /> Start Quiz
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Exam Taking Modal */}
      {activeTest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 24, overflowY: 'auto' }}>
            {testResult ? (
              /* Score Result Screen */
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Award size={56} style={{ color: testResult.passed ? 'var(--color-success-500)' : 'var(--color-danger-500)', marginBottom: 16 }} />
                <h2 style={{ fontSize: 22, fontWeight: 700 }}>Assessment Completed</h2>
                <div style={{ fontSize: 36, fontWeight: 800, margin: '16px 0', color: testResult.passed ? 'var(--color-success-500)' : 'var(--color-danger-500)' }}>
                  {testResult.score} / {testResult.maxScore} pts
                </div>
                <div className={`badge ${testResult.passed ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: 14, padding: '4px 12px', marginBottom: 20 }}>
                  {testResult.passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
                  Anti-Cheat Logs: {tabSwitchCount} tab switch events recorded.
                </p>
                <button className="btn btn-primary" onClick={() => setActiveTest(null)}>Close Assessment</button>
              </div>
            ) : (
              /* Question Stepper */
              <>
                {/* Modal Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border-color)', marginBottom: 20 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{activeTest.title}</h3>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Question {currentQIndex + 1} of {MOCK_QUESTIONS.length}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(239,68,68,0.12)', color: 'var(--color-danger-500)', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 13 }}>
                      <Clock size={14} /> {formatTimer(timeLeftSeconds)}
                    </div>
                    <button className="btn btn-ghost btn-icon" onClick={() => setActiveTest(null)}><X size={18} /></button>
                  </div>
                </div>

                {/* Question Content */}
                <div style={{ flex: 1, marginBottom: 24 }}>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                    {MOCK_QUESTIONS[currentQIndex].prompt}
                  </p>

                  {/* MCQ & T/F Options */}
                  {(MOCK_QUESTIONS[currentQIndex].type === 'mcq' || MOCK_QUESTIONS[currentQIndex].type === 'tf') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {MOCK_QUESTIONS[currentQIndex].options?.map((opt, oIdx) => {
                        const isSelected = userAnswers[MOCK_QUESTIONS[currentQIndex].id] === oIdx;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleSelectAnswer(MOCK_QUESTIONS[currentQIndex].id, oIdx)}
                            style={{
                              padding: '12px 16px', borderRadius: 'var(--radius-md)', border: `1px solid ${isSelected ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                              background: isSelected ? 'rgba(99,102,241,0.1)' : 'var(--bg-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s',
                            }}
                          >
                            <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--color-primary-500)' : 'var(--border-color)'}`, background: isSelected ? 'var(--color-primary-500)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400 }}>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Short Answer Input */}
                  {MOCK_QUESTIONS[currentQIndex].type === 'short' && (
                    <textarea
                      rows={4}
                      className="form-input"
                      placeholder="Type your short answer response here..."
                      value={userAnswers[MOCK_QUESTIONS[currentQIndex].id] || ''}
                      onChange={(e) => handleSelectAnswer(MOCK_QUESTIONS[currentQIndex].id, e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  )}
                </div>

                {/* Modal Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                  <button className="btn btn-secondary btn-sm" disabled={currentQIndex === 0} onClick={() => setCurrentQIndex((i) => i - 1)}>
                    <ChevronLeft size={16} /> Previous
                  </button>

                  {currentQIndex === MOCK_QUESTIONS.length - 1 ? (
                    <button className="btn btn-primary btn-sm" onClick={handleSubmitTest}>Submit Exam</button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => setCurrentQIndex((i) => i + 1)}>
                      Next <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontWeight: 600, fontSize: '1.125rem' }}>Create Assessment</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateAssessment}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" placeholder="e.g. Midterm Quiz" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Course</label><input className="form-input" value={newCourse} onChange={(e) => setNewCourse(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Time Limit (Minutes)</label><input type="number" className="form-input" value={newTime} onChange={(e) => setNewTime(Number(e.target.value))} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
