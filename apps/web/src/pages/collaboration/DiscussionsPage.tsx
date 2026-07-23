import { useState } from 'react';
import { MessageSquare, Plus, Search, Pin, ThumbsUp, X, Send } from 'lucide-react';

interface Thread {
  id: string;
  title: string;
  author: string;
  avatar: string;
  replies: number;
  views: number;
  lastActivity: string;
  isPinned: boolean;
  tags: string[];
}

export function DiscussionsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('General');
  const [upvotes, setUpvotes] = useState<Record<string, number>>({});

  const handleCreateThread = (e: React.FormEvent) => {
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

    setThreads([created, ...threads]);
    setNewTitle('');
    setShowModal(false);
  };

  const handleUpvote = (id: string) => {
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
          <p>Course Discussion Forum</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Thread
        </button>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div className="topbar-search" style={{ maxWidth: '400px' }}>
          <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
          <input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          No discussion threads yet. Click <strong>+ New Thread</strong> to start a conversation!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {filtered.map((thread) => (
            <div key={thread.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-tertiary)', minWidth: '40px' }}>
                <button 
                  className="btn btn-ghost btn-icon" 
                  style={{ width: '28px', height: '28px' }}
                  onClick={() => handleUpvote(thread.id)}
                  title="Upvote thread"
                >
                  <ThumbsUp size={14} color={(upvotes[thread.id] || 0) > 0 ? 'var(--color-primary-500)' : 'currentColor'} />
                </button>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{thread.views + (upvotes[thread.id] || 0)}</span>
              </div>

              <div className="avatar avatar-sm">{thread.avatar}</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '4px' }}>
                  {thread.isPinned && <Pin size={14} style={{ color: 'var(--color-primary-400)' }} />}
                  <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{thread.title}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{thread.author}</span>
                  <span>·</span>
                  <span>{thread.lastActivity}</span>
                  <span>·</span>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    {thread.tags.map((tag) => (
                      <span key={tag} className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)' }}>
                <MessageSquare size={16} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{thread.replies}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Thread Modal Overlay */}
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
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: 'var(--space-6)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Start New Thread</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateThread} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Topic / Title
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Question regarding Assignment 2 deadline"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Category Tag
                </label>
                <select className="form-input" value={newTag} onChange={(e) => setNewTag(e.target.value)}>
                  <option value="General">General</option>
                  <option value="Help">Help</option>
                  <option value="Lab">Lab</option>
                  <option value="Study Group">Study Group</option>
                  <option value="Announcement">Announcement</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Send size={16} /> Post Thread
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
