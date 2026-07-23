import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { MessageSquare, Plus, Search, Pin, ThumbsUp, X, Send } from 'lucide-react';
import { collaborationService, Thread } from '../../api/services/collaboration.service';
import { useAuthStore } from '../../store/auth.store';

export function DiscussionsPage() {
  const user = useAuthStore((state: any) => state.user);
  const userRole = (user?.role || user?.roles?.[0] || 'student').toLowerCase();

  if (userRole === 'student' || userRole === 'parent') {
    return <Navigate to="/dashboard" replace />;
  }

  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('General');
  const [upvotes, setUpvotes] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchThreads() {
      setLoading(true);
      try {
        const res = await collaborationService.getThreads();
        if (res.success && res.data) {
          setThreads(res.data);
        }
      } catch (err) {
        console.warn('Backend collaboration service unreachable or unseeded.', err);
      } finally {
        setLoading(false);
      }
    }
    fetchThreads();
  }, []);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const created: Thread = {
      id: Date.now().toString(),
      title: newTitle,
      author: 'Current User',
      avatar: 'CU',
      replies: 0,
      views: 1,
      lastActivity: 'Just now',
      isPinned: false,
      tags: [newTag],
    };

    try {
      await collaborationService.createThread({
        title: newTitle,
        tags: [newTag],
      });
    } catch (err) {
      console.warn('Create thread backend call fallback.', err);
    }

    setThreads([created, ...threads]);
    setNewTitle('');
    setShowModal(false);
  };

  const handleUpvote = async (id: string) => {
    try {
      await collaborationService.upvoteThread(id);
    } catch (err) {
      console.warn('Upvote thread API error.', err);
    }
    setUpvotes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const filtered = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Discussions</h1>
          <p>Collaborative forums and course Q&A channels</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Thread
        </button>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div className="topbar-search" style={{ maxWidth: '400px' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            placeholder="Search discussion threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Fetching discussion threads from backend...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <MessageSquare size={36} style={{ marginBottom: 'var(--space-3)', opacity: 0.5 }} />
          <p>No discussion threads found. Click "New Thread" to start a conversation.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filtered.map((t) => (
            <div key={t.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '0.875rem' }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    {t.isPinned && <Pin size={14} style={{ color: 'var(--color-primary-500)' }} />}
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{t.title}</h3>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: 'var(--space-3)' }}>
                    <span>By {t.author}</span>
                    <span>•</span>
                    <span>{t.lastActivity}</span>
                    <span>•</span>
                    <span>{t.replies} replies</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                {t.tags.map((tag) => (
                  <span key={tag} className="badge badge-purple">
                    {tag}
                  </span>
                ))}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleUpvote(t.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ThumbsUp size={14} />
                  {upvotes[t.id] || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Thread Modal */}
      {showModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Start Discussion Thread</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateThread}>
              <div className="form-group">
                <label className="form-label">Thread Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Questions regarding Midterm Exam Topics"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category Tag</label>
                <select className="form-input" value={newTag} onChange={(e) => setNewTag(e.target.value)}>
                  <option value="General">General</option>
                  <option value="Assignments">Assignments</option>
                  <option value="Exams">Exams</option>
                  <option value="Feedback">Feedback</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
