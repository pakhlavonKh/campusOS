import { useState } from 'react';
import { MessageSquare, Plus, Search, Pin, ThumbsUp } from 'lucide-react';

const mockThreads = [
  {
    id: '1',
    title: 'Question about Lab 3 Data Analysis',
    author: 'Daniel Williams',
    avatar: 'DW',
    replies: 4,
    views: 45,
    lastActivity: '2 hours ago',
    isPinned: false,
    tags: ['Lab', 'Help'],
  },
  {
    id: '2',
    title: '[Important] Midterm Exam Study Guide',
    author: 'Dr. Sarah Chen',
    avatar: 'SC',
    replies: 12,
    views: 120,
    lastActivity: '1 day ago',
    isPinned: true,
    tags: ['Announcement'],
  },
  {
    id: '3',
    title: 'Study group for upcoming quiz?',
    author: 'Alice Thompson',
    avatar: 'AT',
    replies: 8,
    views: 34,
    lastActivity: '3 hours ago',
    isPinned: false,
    tags: ['Study Group'],
  },
];

export function DiscussionsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Discussions</h1>
          <p>Physics 101 Course Forum</p>
        </div>
        <button className="btn btn-primary">
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {mockThreads.map((thread) => (
          <div key={thread.id} className="card" style={{ padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--text-tertiary)', minWidth: '40px' }}>
              <button className="btn btn-ghost btn-icon" style={{ width: '28px', height: '28px' }}>
                <ThumbsUp size={14} />
              </button>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{thread.views}</span>
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
    </div>
  );
}
