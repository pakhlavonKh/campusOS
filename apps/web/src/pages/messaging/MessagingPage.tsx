import { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Send, Search, Paperclip, Smile, MoreVertical, Plus, X, FileText } from 'lucide-react';
import { messagingService, Conversation, Message } from '../../api/services/messaging.service';
import { storageService } from '../../api/services/storage.service';
import { useAuthStore } from '../../store/auth.store';

export function MessagingPage() {
  const user = useAuthStore((state: any) => state.user);
  const userRole = (user?.role || user?.roles?.[0] || 'student').toLowerCase();

  if (userRole === 'parent') {
    return <Navigate to="/dashboard" replace />;
  }

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvoId, setSelectedConvoId] = useState<string>('');
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [loading, setLoading] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; url?: string }[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchConversations() {
      setLoading(true);
      try {
        const res = await messagingService.getConversations();
        if (res.success && res.data && res.data.length > 0) {
          setConversations(res.data);
          setSelectedConvoId(res.data[0].id);
        }
      } catch (err) {
        console.warn('Backend messaging service returned empty or unseeded data.', err);
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConvoId) return;
    async function fetchMessages() {
      try {
        const res = await messagingService.getMessages(selectedConvoId);
        if (res.success && res.data) {
          setMessagesMap((prev) => ({ ...prev, [selectedConvoId]: res.data }));
        }
      } catch (err) {
        console.warn('Failed to fetch messages for conversation.', err);
      }
    }
    fetchMessages();
  }, [selectedConvoId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesMap, selectedConvoId]);

  const currentConvo = conversations.find((c) => c.id === selectedConvoId);
  const currentMessages = selectedConvoId ? messagesMap[selectedConvoId] || [] : [];

  const handleChatFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let fileUrl: string | undefined;
      try {
        const uploadRes = await storageService.uploadFile(file);
        if (uploadRes.success && uploadRes.data?.url) {
          fileUrl = uploadRes.data.url;
        }
      } catch (err) {
        console.warn('Upload fallback.', err);
      }

      setAttachedFiles((prev) => [
        ...prev,
        {
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          url: fileUrl,
        },
      ]);
    }

    if (chatFileInputRef.current) chatFileInputRef.current.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!messageInput.trim() && attachedFiles.length === 0) || !selectedConvoId) return;

    let fullContent = messageInput.trim();
    if (attachedFiles.length > 0) {
      const fileListStr = attachedFiles.map((f) => `📎 ${f.name} (${f.size})`).join('\n');
      fullContent = fullContent ? `${fullContent}\n\n${fileListStr}` : fileListStr;
    }

    const newMessage: Message = {
      id: `m_${Date.now()}`,
      sender: 'You',
      content: fullContent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    try {
      await messagingService.sendMessage(selectedConvoId, fullContent);
    } catch (err) {
      console.warn('Send message backend API error.', err);
    }

    setMessagesMap((prev) => ({
      ...prev,
      [selectedConvoId]: [...(prev[selectedConvoId] || []), newMessage],
    }));

    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvoId
          ? { ...c, lastMessage: fullContent.split('\n')[0], time: 'Just now', unread: 0 }
          : c
      )
    );

    setMessageInput('');
    setAttachedFiles([]);
  };

  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    const initials = newContactName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newConvo: Conversation = {
      id: Date.now().toString(),
      name: newContactName,
      avatar: initials || 'NC',
      lastMessage: 'Conversation started',
      time: 'Just now',
      unread: 0,
      online: true,
    };

    try {
      await messagingService.createConversation(newContactName);
    } catch (err) {
      console.warn('Create conversation backend API error.', err);
    }

    setConversations([newConvo, ...conversations]);
    setMessagesMap((prev) => ({
      ...prev,
      [newConvo.id]: [],
    }));
    setSelectedConvoId(newConvo.id);
    setNewContactName('');
    setShowNewChatModal(false);
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="page-header-left">
          <h1>Direct Messaging</h1>
          <p>Real-time chat with faculty, students, and course groups</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewChatModal(true)}>
          <Plus size={16} /> New Chat
        </button>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0 }}>
        {/* Left Sidebar: Conversations Roster */}
        <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="topbar-search" style={{ width: '100%' }}>
              <Search size={16} style={{ color: 'var(--text-tertiary)' }} />
              <input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading chats...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No chats found. Click "New Chat" to start messaging.
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredConversations.map((convo) => (
                <div
                  key={convo.id}
                  onClick={() => setSelectedConvoId(convo.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    cursor: 'pointer',
                    backgroundColor: selectedConvoId === convo.id ? 'var(--bg-tertiary)' : 'transparent',
                    borderBottom: '1px solid var(--border-color)',
                  }}
                >
                  <div className="avatar" style={{ width: '40px', height: '40px', fontSize: '0.875rem' }}>
                    {convo.avatar}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{convo.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{convo.time}</span>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {convo.lastMessage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Pane: Active Message Thread */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {currentConvo ? (
            <>
              {/* Header */}
              <div style={{ padding: 'var(--space-4) var(--space-6)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.875rem' }}>
                    {currentConvo.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{currentConvo.name}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-success-600)' }}>Active Channel</span>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div style={{ flex: 1, padding: 'var(--space-6)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {currentMessages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.isOwn ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: m.isOwn ? 'var(--color-primary-600)' : 'var(--bg-tertiary)',
                      color: m.isOwn ? '#ffffff' : 'var(--text-primary)',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {!m.isOwn && (
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px', color: 'var(--color-primary-400)' }}>
                        {m.sender}
                      </div>
                    )}
                    <p style={{ fontSize: '0.9375rem', lineHeight: 1.4 }}>{m.content}</p>
                    <div style={{ fontSize: '0.6875rem', textAlign: 'right', marginTop: '4px', opacity: 0.8 }}>
                      {m.time}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Attached Pending Files Bar */}
              {attachedFiles.length > 0 && (
                <div style={{ padding: 'var(--space-2) var(--space-6)', backgroundColor: 'var(--bg-tertiary)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {attachedFiles.map((f, idx) => (
                    <span key={idx} className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={12} /> {f.name} ({f.size})
                      <X size={12} style={{ cursor: 'pointer' }} onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))} />
                    </span>
                  ))}
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleSendMessage} style={{ padding: 'var(--space-4) var(--space-6)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <input
                  type="file"
                  ref={chatFileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  onChange={handleChatFileSelect}
                />
                <button
                  type="button"
                  className="btn btn-secondary btn-icon"
                  onClick={() => chatFileInputRef.current?.click()}
                  title="Attach File"
                >
                  <Paperclip size={18} />
                </button>
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <Send size={16} /> Send
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
              Select a conversation from the left to start messaging
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
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
          <div className="card" style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Start New Conversation</h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowNewChatModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStartNewChat}>
              <div className="form-group">
                <label className="form-label">Contact / Group Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Prof. James Wilson"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewChatModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
