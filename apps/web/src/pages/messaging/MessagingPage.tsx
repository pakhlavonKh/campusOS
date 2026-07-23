import { useState, useRef, useEffect } from 'react';
import { Send, Search, Paperclip, Smile, MoreVertical, Plus, X } from 'lucide-react';

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

const initialConversations: Conversation[] = [
  { id: '1', name: 'Dr. Sarah Chen', avatar: 'SC', lastMessage: 'The lab report deadline has been extended...', time: '2 min', unread: 2, online: true },
  { id: '2', name: 'Physics 101 Group', avatar: 'P1', lastMessage: 'Has everyone completed the pre-lab?', time: '15 min', unread: 5, online: false },
  { id: '3', name: 'Prof. James Wilson', avatar: 'JW', lastMessage: 'Grade corrections have been posted', time: '1 hr', unread: 0, online: true },
  { id: '4', name: 'Emma Rodriguez', avatar: 'ER', lastMessage: 'Thank you for the feedback!', time: '3 hr', unread: 0, online: false },
  { id: '5', name: 'Staff Announcements', avatar: 'SA', lastMessage: 'Reminder: Faculty meeting tomorrow at 2 PM', time: '5 hr', unread: 1, online: false },
];

const initialMessagesMap: Record<string, Message[]> = {
  '1': [
    { id: 'm1_1', sender: 'Dr. Sarah Chen', content: 'Hi! I wanted to let you know about the upcoming changes to the Physics 101 syllabus.', time: '10:30 AM', isOwn: false },
    { id: 'm1_2', sender: 'You', content: 'Thanks for the heads up. What are the main changes?', time: '10:32 AM', isOwn: true },
    { id: 'm1_3', sender: 'Dr. Sarah Chen', content: 'We\'re adding a new module on quantum entanglement and extending the lab report deadline by one week.', time: '10:35 AM', isOwn: false },
    { id: 'm1_4', sender: 'You', content: 'That sounds great! The students will appreciate the extra time for the lab reports.', time: '10:36 AM', isOwn: true },
    { id: 'm1_5', sender: 'Dr. Sarah Chen', content: 'The lab report deadline has been extended to next Friday. Please share this with your students.', time: '10:40 AM', isOwn: false },
  ],
  '2': [
    { id: 'm2_1', sender: 'Alex', content: 'Hey everyone, working on Problem Set 4 right now.', time: '11:10 AM', isOwn: false },
    { id: 'm2_2', sender: 'You', content: 'Are you stuck on Question 3 or 4?', time: '11:12 AM', isOwn: true },
    { id: 'm2_3', sender: 'Alex', content: 'Has everyone completed the pre-lab?', time: '11:15 AM', isOwn: false },
  ],
  '3': [
    { id: 'm3_1', sender: 'Prof. James Wilson', content: 'Hello! I reviewed your midterm paper draft.', time: '09:15 AM', isOwn: false },
    { id: 'm3_2', sender: 'Prof. James Wilson', content: 'Grade corrections have been posted', time: '09:20 AM', isOwn: false },
  ],
  '4': [
    { id: 'm4_1', sender: 'Emma Rodriguez', content: 'Hi Dr. Jenkins, thanks for explaining the lab procedure.', time: '08:00 AM', isOwn: false },
    { id: 'm4_2', sender: 'Emma Rodriguez', content: 'Thank you for the feedback!', time: '08:05 AM', isOwn: false },
  ],
  '5': [
    { id: '5_1', sender: 'Staff Announcements', content: 'Reminder: Faculty meeting tomorrow at 2 PM in Room 302.', time: '07:30 AM', isOwn: false },
  ],
};

export function MessagingPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConvoId, setSelectedConvoId] = useState<string>('1');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(initialMessagesMap);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedConvo = conversations.find((c) => c.id === selectedConvoId) || conversations[0];
  const currentMessages = messagesMap[selectedConvoId] || [];

  // Auto-scroll chat to bottom on new message or conversation select
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvoId, currentMessages.length]);

  // Select conversation & mark unread as read
  const handleSelectConvo = (convoId: string) => {
    setSelectedConvoId(convoId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convoId ? { ...c, unread: 0 } : c))
    );
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    const text = messageInput.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      sender: 'You',
      content: text,
      time: timeStr,
      isOwn: true,
    };

    // Update messages for current conversation
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConvoId]: [...(prev[selectedConvoId] || []), newMsg],
    }));

    // Update conversation item in sidebar
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvoId
          ? { ...c, lastMessage: text, time: 'Just now' }
          : c
      )
    );

    setMessageInput('');
  };

  const handleCreateNewChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const newId = `c_${Date.now()}`;
    const initials = newContactName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'NC';

    const newConvo: Conversation = {
      id: newId,
      name: newContactName.trim(),
      avatar: initials,
      lastMessage: 'Conversation started',
      time: 'Just now',
      unread: 0,
      online: true,
    };

    setConversations([newConvo, ...conversations]);
    setMessagesMap((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `msg_init_${Date.now()}`,
          sender: newContactName,
          content: `Hello! Started new conversation with ${newContactName}.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isOwn: false,
        },
      ],
    }));

    setSelectedConvoId(newId);
    setNewContactName('');
    setShowNewChatModal(false);
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: 0,
        height: 'calc(100vh - var(--topbar-height) - 90px)',
        maxHeight: 'calc(100vh - var(--topbar-height) - 90px)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Conversation List */}
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Header & Search */}
        <div style={{ padding: 'var(--space-4)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Messages</h2>
            <button
              className="btn btn-primary"
              style={{ padding: '4px 10px', fontSize: '0.8125rem', gap: '4px' }}
              onClick={() => setShowNewChatModal(true)}
            >
              <Plus size={14} /> New Chat
            </button>
          </div>
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
          {filteredConversations.map((convo) => (
            <div
              key={convo.id}
              onClick={() => handleSelectConvo(convo.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-4)',
                cursor: 'pointer',
                background:
                  selectedConvo.id === convo.id
                    ? 'rgba(99, 102, 241, 0.12)'
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
                      fontWeight: convo.unread > 0 ? 700 : 500,
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
                      maxWidth: '180px',
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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-primary)',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Chat Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0,
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
            minHeight: 0,
            overflowY: 'auto',
            padding: 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {currentMessages.map((msg) => (
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
                  color: msg.isOwn ? '#ffffff' : 'var(--text-primary)',
                }}
              >
                <div style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{msg.content}</div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: msg.isOwn ? 'rgba(255,255,255,0.7)' : 'var(--text-tertiary)',
                    marginTop: 'var(--space-1)',
                    textAlign: 'right',
                  }}
                >
                  {msg.time}
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={handleSendMessage}
          style={{
            padding: 'var(--space-3) var(--space-6)',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--bg-secondary)',
            flexShrink: 0,
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
            <button type="button" className="btn btn-ghost btn-icon" style={{ width: '32px', height: '32px' }}>
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
              placeholder={`Message ${selectedConvo.name}...`}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
            />
            <button type="button" className="btn btn-ghost btn-icon" style={{ width: '32px', height: '32px' }}>
              <Smile size={18} />
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '36px',
                height: '36px',
                padding: 0,
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* New Chat Modal Overlay */}
      {showNewChatModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: 'var(--space-6)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Start New Conversation</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNewChatModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                  Recipient Name / Student / Faculty
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Robert Miller"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewChatModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Start Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
