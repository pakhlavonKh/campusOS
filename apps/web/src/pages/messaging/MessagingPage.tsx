import { useState } from 'react';
import { Send, Search, Paperclip, Smile, MoreVertical } from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
}

const mockConversations: Conversation[] = [
  { id: '1', name: 'Dr. Sarah Chen', avatar: 'SC', lastMessage: 'The lab report deadline has been extended...', time: '2 min', unread: 2, online: true },
  { id: '2', name: 'Physics 101 Group', avatar: 'P1', lastMessage: 'Has everyone completed the pre-lab?', time: '15 min', unread: 5, online: false },
  { id: '3', name: 'Prof. James Wilson', avatar: 'JW', lastMessage: 'Grade corrections have been posted', time: '1 hr', unread: 0, online: true },
  { id: '4', name: 'Emma Rodriguez', avatar: 'ER', lastMessage: 'Thank you for the feedback!', time: '3 hr', unread: 0, online: false },
  { id: '5', name: 'Staff Announcements', avatar: 'SA', lastMessage: 'Reminder: Faculty meeting tomorrow at 2 PM', time: '5 hr', unread: 1, online: false },
];

const mockMessages: Message[] = [
  { id: '1', sender: 'Dr. Sarah Chen', content: 'Hi! I wanted to let you know about the upcoming changes to the Physics 101 syllabus.', time: '10:30 AM', isOwn: false },
  { id: '2', sender: 'You', content: 'Thanks for the heads up. What are the main changes?', time: '10:32 AM', isOwn: true },
  { id: '3', sender: 'Dr. Sarah Chen', content: 'We\'re adding a new module on quantum entanglement and extending the lab report deadline by one week.', time: '10:35 AM', isOwn: false },
  { id: '4', sender: 'You', content: 'That sounds great! The students will appreciate the extra time for the lab reports.', time: '10:36 AM', isOwn: true },
  { id: '5', sender: 'Dr. Sarah Chen', content: 'The lab report deadline has been extended to next Friday. Please share this with your students.', time: '10:40 AM', isOwn: false },
];

export function MessagingPage() {
  const [selectedConvo, setSelectedConvo] = useState(mockConversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: 0,
        height: 'calc(100vh - var(--topbar-height) - var(--space-16))',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      {/* Conversation List */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search */}
        <div style={{ padding: 'var(--space-4)' }}>
          <div className="topbar-search" style={{ minWidth: 'unset' }}>
            <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
            <input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Conversation items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {mockConversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => setSelectedConvo(convo)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                cursor: 'pointer',
                background:
                  selectedConvo.id === convo.id
                    ? 'rgba(99, 102, 241, 0.08)'
                    : 'transparent',
                borderLeft:
                  selectedConvo.id === convo.id
                    ? '3px solid var(--color-primary-500)'
                    : '3px solid transparent',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div className="avatar avatar-sm">{convo.avatar}</div>
                {convo.online && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--color-accent-500)',
                      border: '2px solid var(--bg-secondary)',
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontWeight: convo.unread > 0 ? 600 : 500,
                      fontSize: '0.875rem',
                    }}
                  >
                    {convo.name}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                    {convo.time}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      color: convo.unread > 0 ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px',
                    }}
                  >
                    {convo.lastMessage}
                  </span>
                  {convo.unread > 0 && (
                    <span
                      style={{
                        background: 'var(--color-primary-500)',
                        color: 'white',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-full)',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {convo.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        {/* Chat Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="avatar">{selectedConvo.avatar}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{selectedConvo.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                {selectedConvo.online ? (
                  <span style={{ color: 'var(--color-accent-400)' }}>● Online</span>
                ) : (
                  'Offline'
                )}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon">
            <MoreVertical size={18} />
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                justifyContent: msg.isOwn ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '60%',
                  padding: 'var(--space-3) var(--space-4)',
                  borderRadius: msg.isOwn
                    ? 'var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)'
                    : 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)',
                  background: msg.isOwn
                    ? 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500))'
                    : 'var(--bg-elevated)',
                  border: msg.isOwn ? 'none' : '1px solid var(--border-color)',
                }}
              >
                <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{msg.content}</div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: msg.isOwn ? 'rgba(255,255,255,0.6)' : 'var(--text-tertiary)',
                    marginTop: 'var(--space-1)',
                    textAlign: 'right',
                  }}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div
          style={{
            padding: 'var(--space-4) var(--space-6)',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-2) var(--space-4)',
            }}
          >
            <button className="btn btn-ghost btn-icon" style={{ width: '32px', height: '32px' }}>
              <Paperclip size={18} />
            </button>
            <input
              style={{
                flex: 1,
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                outline: 'none',
              }}
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button className="btn btn-ghost btn-icon" style={{ width: '32px', height: '32px' }}>
              <Smile size={18} />
            </button>
            <button
              className="btn btn-primary"
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                borderRadius: 'var(--radius-full)',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
