import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  Clock,
  BookOpen,
} from 'lucide-react';

import { coursesService, Course } from '../../api/services/courses.service';
import { useAuthStore } from '../../store/auth.store';

const mockCourses: Course[] = [
  { id: '1', title: 'Advanced Physics: Quantum Mechanics', subject: 'Physics', format: 'Semester', status: 'published', students: 32, modules: 12, instructor: 'Dr. Sarah Chen', progress: 67 },
  { id: '2', title: 'Organic Chemistry Fundamentals', subject: 'Chemistry', format: 'Topic-Based', status: 'published', students: 45, modules: 8, instructor: 'Prof. James Wilson', progress: 45 },
  { id: '3', title: 'Data Structures & Algorithms', subject: 'Computer Science', format: 'Self-Paced', status: 'published', students: 78, modules: 15, instructor: 'Dr. Maya Patel', progress: 82 },
  { id: '4', title: 'Modern World History', subject: 'History', format: 'Week-Based', status: 'draft', students: 0, modules: 20, instructor: 'Prof. Robert Kim', progress: 0 },
  { id: '5', title: 'Creative Writing Workshop', subject: 'English', format: 'Instructor-Led', status: 'published', students: 24, modules: 6, instructor: 'Ms. Emma Davis', progress: 90 },
  { id: '6', title: 'Calculus III: Multivariable', subject: 'Mathematics', format: 'Semester', status: 'published', students: 55, modules: 10, instructor: 'Dr. Alan Brooks', progress: 33 },
];

export function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const organizationId = useAuthStore((state) => state.organizationId);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!organizationId) return;
      try {
        setLoading(true);
        const response = await coursesService.getCourses(organizationId);
        if (response.success) {
          setCourses(response.data);
        }
      } catch (e) {
        console.error('Failed to fetch courses', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [organizationId]);

  const filtered = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c as any).subject?.toLowerCase().includes(searchQuery.toLowerCase());
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
        <button className="btn btn-primary">
          <Plus size={16} />
          New Course
        </button>
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
                {/* @ts-ignore - mock property */}
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
              {/* @ts-ignore - mock property */}
              {(course as any).instructor || 'No Instructor'} · {course.format || 'Standard'}
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
    </div>
  );
}
