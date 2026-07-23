import { useState, useEffect } from 'react';
import {
  Mic,
  Square,
  Volume2,
  Globe,
  Award,
  CheckCircle2,
  RotateCcw,
  BookOpen,
  Play,
  Send,
  UserCheck,
  Clock,
  FileAudio,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface VoiceExercise {
  id: string;
  course: string;
  title: string;
  language: string;
  prompt: string;
  referenceAudio: string;
  dueDate: string;
}

interface Submission {
  id: string;
  studentName: string;
  exerciseTitle: string;
  duration: string;
  submittedAt: string;
  status: 'pending_review' | 'graded';
  grade?: string;
  feedback?: string;
}

const EXERCISES: VoiceExercise[] = [
  { id: 'v1', course: 'CS301', title: 'Data Structures Terminology Practice', language: 'en-US', prompt: 'Read aloud: "Binary search algorithms achieve logarithmic time complexity by halving the search space in each step."', referenceAudio: '/audio/sample1.mp3', dueDate: '2026-08-05' },
  { id: 'v2', course: 'ENG120', title: 'Technical Presentation Opening', language: 'en-US', prompt: 'Read aloud: "Welcome everyone. Today I will present our scalable multi-tenant SaaS application architecture."', referenceAudio: '/audio/sample2.mp3', dueDate: '2026-08-08' },
  { id: 'v3', course: 'LANG101', title: 'Uzbek Articulation Exercise', language: 'uz-UZ', prompt: 'Read aloud: "Bilim va ma’rifat insoniyatning eng buyuk boyligidir."', referenceAudio: '/audio/sample3.mp3', dueDate: '2026-08-10' },
];

const MOCK_SUBMISSIONS: Submission[] = [
  { id: 's1', studentName: 'Alex Johnson', exerciseTitle: 'Data Structures Terminology Practice', duration: '00:14', submittedAt: '10 min ago', status: 'pending_review' },
  { id: 's2', studentName: 'Priya Sharma', exerciseTitle: 'Technical Presentation Opening', duration: '00:18', submittedAt: '1 hour ago', status: 'graded', grade: '95 / 100', feedback: 'Clear articulation and excellent pacing!' },
];

export function VoicePage() {
  const user = useAuthStore((state: any) => state.user);
  const activeMembership = useAuthStore((state) => state.activeMembership);
  const userRole = (activeMembership?.role || user?.role || user?.roles?.[0] || 'student').toLowerCase();
  const isTeacher = ['teacher', 'assistant_teacher', 'org_admin', 'branch_admin', 'super_admin'].includes(userRole);

  const [selectedExercise, setSelectedExercise] = useState<VoiceExercise>(EXERCISES[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Teacher Review State
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [reviewGrade, setReviewGrade] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setHasRecorded(false);
    setIsSubmitted(false);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);
  };

  const handleSubmitToTeacher = () => {
    setIsSubmitted(true);
    setSubmissions([
      {
        id: `s_${Date.now()}`,
        studentName: `${user?.firstName || 'Student'} ${user?.lastName || ''}`.trim(),
        exerciseTitle: selectedExercise.title,
        duration: `00:${recordingTime < 10 ? '0' : ''}${recordingTime}`,
        submittedAt: 'Just now',
        status: 'pending_review',
      },
      ...submissions,
    ]);
  };

  const handleGradeSubmission = (subId: string) => {
    if (!reviewGrade) return;
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === subId ? { ...s, status: 'graded', grade: reviewGrade, feedback: reviewFeedback } : s
      )
    );
    setActiveSubmissionId(null);
    setReviewGrade('');
    setReviewFeedback('');
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Voice & Pronunciation Studio</h1>
          <p>{isTeacher ? 'Review and grade student oral speaking recordings and pronunciation exercises' : 'Record your speaking assignments and submit them for teacher evaluation'}</p>
        </div>
      </div>

      {isTeacher ? (
        /* ── TEACHER GRADING QUEUE ───────────────────────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserCheck size={18} style={{ color: 'var(--color-primary-500)' }} />
                Student Audio Submissions Queue
              </h3>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Exercise Title</th>
                  <th>Duration</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td style={{ fontWeight: 600 }}>{sub.studentName}</td>
                    <td>{sub.exerciseTitle}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>{sub.duration}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{sub.submittedAt}</td>
                    <td>
                      <span className={`badge ${sub.status === 'graded' ? 'badge-success' : 'badge-warning'}`}>
                        {sub.status === 'graded' ? `Graded (${sub.grade})` : 'Pending Teacher Review'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => setActiveSubmissionId(sub.id)}>
                        <FileAudio size={14} /> {sub.status === 'graded' ? 'Review Grade' : 'Listen & Grade'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Teacher Review Drawer / Modal */}
          {activeSubmissionId && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000 }}>
              <div className="card" style={{ width: '100%', maxWidth: 500, padding: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Evaluate Audio Recording</h3>
                <div style={{ padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Audio Playback</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => alert('Playing student audio submission...')}>
                    <Play size={14} /> Play Recording (00:14)
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Grade / Score</label>
                  <input className="form-input" placeholder="e.g. 95 / 100" value={reviewGrade} onChange={(e) => setReviewGrade(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Teacher Feedback & Comments</label>
                  <textarea className="form-input" rows={3} placeholder="Enter oral feedback for student..." value={reviewFeedback} onChange={(e) => setReviewFeedback(e.target.value)} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 20 }}>
                  <button className="btn btn-secondary" onClick={() => setActiveSubmissionId(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => handleGradeSubmission(activeSubmissionId)}>Submit Grade</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── STUDENT RECORDING & SUBMISSION VIEW ────────────────────────── */
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-6)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Prompt Card */}
            <div className="card" style={{ padding: 24, borderTop: '4px solid var(--color-primary-500)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="badge badge-info">{selectedExercise.course}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Due {selectedExercise.dueDate}</span>
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{selectedExercise.title}</h2>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', padding: 16, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', margin: '12px 0 16px', lineHeight: 1.5 }}>
                {selectedExercise.prompt}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => alert('Playing reference audio recorded by instructor...')}>
                <Volume2 size={14} /> Listen to Reference Audio
              </button>
            </div>

            {/* Audio Recorder */}
            <div className="card" style={{ padding: 32, textAlign: 'center' }}>
              {isRecording ? (
                /* Waveform visualizer */
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, height: 60, marginBottom: 16 }}>
                  {[35, 65, 85, 40, 95, 70, 50, 80, 60, 90, 45, 75].map((h, i) => (
                    <div key={i} style={{ width: 6, height: `${h}%`, background: 'var(--color-danger-500)', borderRadius: 99, animation: `pulse 0.5s infinite alternate ${i * 0.07}s` }} />
                  ))}
                </div>
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Mic size={36} style={{ color: 'var(--color-primary-500)' }} />
                </div>
              )}

              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                {isRecording ? `Recording... 00:${recordingTime < 10 ? '0' : ''}${recordingTime}` : hasRecorded ? 'Recording Completed' : 'Ready to Record'}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                {isRecording ? 'Speak clearly into your microphone' : hasRecorded ? 'Listen back to your recording or submit to your instructor' : 'Click start to record your voice assignment'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                {!isRecording && (
                  <button className="btn btn-primary" style={{ padding: '10px 24px' }} onClick={handleStartRecording}>
                    <Mic size={16} /> {hasRecorded ? 'Re-record Audio' : 'Start Recording'}
                  </button>
                )}
                {isRecording && (
                  <button className="btn btn-primary" style={{ background: 'var(--color-danger-500)', padding: '10px 24px' }} onClick={handleStopRecording}>
                    <Square size={16} /> Stop Recording
                  </button>
                )}
                {hasRecorded && !isRecording && !isSubmitted && (
                  <button className="btn btn-primary" style={{ background: 'var(--color-success-500)', padding: '10px 24px' }} onClick={handleSubmitToTeacher}>
                    <Send size={16} /> Submit to Teacher
                  </button>
                )}
              </div>

              {isSubmitted && (
                <div style={{ marginTop: 20, padding: 14, background: 'rgba(16,185,129,0.1)', color: 'var(--color-success-500)', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} /> Recording submitted to teacher queue for review!
                </div>
              )}
            </div>
          </div>

          {/* Assignment Selector Sidebar */}
          <div className="card">
            <div className="card-header"><h3 style={{ fontWeight: 600 }}>Voice Assignments</h3></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {EXERCISES.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => { setSelectedExercise(ex); setHasRecorded(false); setIsSubmitted(false); }}
                  style={{
                    padding: 12, borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    border: `1px solid ${selectedExercise.id === ex.id ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                    background: selectedExercise.id === ex.id ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary-500)', marginBottom: 2 }}>{ex.course}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ex.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>Due {ex.dueDate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
