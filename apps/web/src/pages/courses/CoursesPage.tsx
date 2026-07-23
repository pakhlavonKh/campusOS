import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MoreHorizontal,
  Users,
  BookOpen,
  X,
  Send,
} from 'lucide-react';

import { coursesService, Course } from '../../api/services/courses.service';
import { useAuthStore } from '../../store/auth.store';

export function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Computer Science');
  const [newFormat, setNewFormat] = useState('instructor_led');
  const [newDescription, setNewDescription] = useState('');

  const user = useAuthStore((state: any) => state.user);
  const organizationId = useAuthStore((state) => state.organizationId);
  const userRole = (user?.role || user?.roles?.[0] || 'student').toLowerCase();
  const isAdmin = ['super_admin', 'org_admin', 'branch_admin', 'admin'].includes(userRole);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!organizationId) return;
      try {
        setLoading(true);
        const response = await coursesService.getCourses(organizationId);
        if (response.success && response.data) {
          setCourses(response.data);
        }
      } catch (e) {
        console.warn('Backend courses API unavailable:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [organizationId]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newTitle.trim()) return;

    const newCourseObj: Course = {
      id: `c_${Date.now()}`,
      organizationId: organizationId || 'default',
      title: newTitle,
      description: newDescription,
      status: 'published',
      format: newFormat,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // @ts-ignore
      subject: newSubject,
      instructor: 'Teacher Account',
      progress: 0,
      students: 0,
      modules: 0,
    };

    try {
      if (organizationId) {
        await coursesService.createCourse({
          title: newTitle,
          description: newDescription,
          format: newFormat,
        });
      }
    } catch (err) {
      console.warn('Offline create course:', err);
    }

    setCourses([newCourseObj, ...courses]);
    setNewTitle('');
    setNewDescription('');
    setShowModal(false);
  };

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ((c as any).subject || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Courses</h1>
          <p>Manage your curriculum and course content</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            New Course
          </button>
        )}
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div className="topbar-search" style={{ flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ width: 'auto', minWidth: '140px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          Loading courses...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          No courses found. Create one to get started!
        </div>
      ) : (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: 'var(--space-6)',
        }}
      >
        {filtered.map((course) => (
          <div
            key={course.id}
            className="card"
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            {/* Status badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-4)',
              }}
            >
              <span
                className={`badge ${
                  course.status === 'published'
                    ? 'badge-success'
                    : course.status === 'draft'
                    ? 'badge-warning'
                    : 'badge-neutral'
                }`}
              >
                {course.status}
              </span>
              <button className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                <MoreHorizontal size={16} />
              </button>
            </div>

            {/* Course info */}
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--color-primary-400)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {/* @ts-ignore */}
                {(course as any).subject || 'General'}
              </span>
            </div>
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: 'var(--space-2)',
                lineHeight: 1.4,
              }}
            >
              {course.title}
            </h3>
            <p
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-4)',
              }}
            >
              {/* @ts-ignore */}
              {(course as any).instructor || 'Instructor'} · {course.format || 'Standard'}
            </p>

            {/* Progress bar */}
            {course.status === 'published' && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  <span>Progress</span>
                  {/* @ts-ignore */}
                  <span>{(course as any).progress || 0}%</span>
                </div>
                <div
                  style={{
                    height: '4px',
                    borderRadius: '2px',
                    background: 'var(--bg-tertiary)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      /* @ts-ignore */
                      width: `${(course as any).progress || 0}%`,
                      height: '100%',
                      borderRadius: '2px',
                      background: `linear-gradient(90deg, var(--color-primary-500), var(--color-accent-500))`,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Meta */}
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 'var(--space-3)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* @ts-ignore */}
                <Users size={14} /> {(course as any).students || 0} students
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* @ts-ignore */}
                <BookOpen size={14} /> {(course as any).modules || 0} modules
              </span>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* New Course Modal Overlay */}
      {showModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '520px', padding: 'var(--space-6)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create New Course</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Course Title
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CS401 Machine Learning Systems"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Format
                  </label>
                  <select className="form-input" value={newFormat} onChange={(e) => setNewFormat(e.target.value)}>
                    <option value="instructor_led">Instructor Led</option>
                    <option value="self_paced">Self Paced</option>
                    <option value="topic_based">Topic Based</option>
                    <option value="week_based">Week Based</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Description (Optional)
                </label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Overview of curriculum and objectives..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} /> Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
