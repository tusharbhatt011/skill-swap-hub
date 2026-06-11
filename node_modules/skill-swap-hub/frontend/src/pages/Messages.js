import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { formatDistanceToNow } from 'date-fns';

const getRoomId = (id1, id2) => [id1, id2].sort().join('_');

export default function Messages() {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]); // accepted matches
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Load accepted matches (connected users)
  useEffect(() => {
    api.get('/matches', { params: { status: 'accepted' } }).then(res => {
      const users = res.data.map(m => {
        const other = m.requester._id === user._id ? m.receiver : m.requester;
        return other;
      });
      // deduplicate
      const unique = users.filter((u, i, arr) => arr.findIndex(x => x._id === u._id) === i);
      setConnectedUsers(unique);
    }).catch(() => {});
  }, [user._id]);

  // Load past conversations
  useEffect(() => {
    api.get('/messages/conversations/list').then(res => setConversations(res.data)).catch(() => {});
  }, []);

  // Auto-open user from URL param (coming from Matches page)
  useEffect(() => {
    const userId = searchParams.get('userId');
    const userName = searchParams.get('userName');
    if (userId && userName) {
      setActiveUser({ _id: userId, name: decodeURIComponent(userName) });
    }
  }, [searchParams]);

  // Load messages when activeUser changes
  useEffect(() => {
    if (!activeUser) return;
    setLoadingMessages(true);
    setMessages([]);
    const roomId = getRoomId(user._id, activeUser._id);
    socket?.emit('join_room', roomId);
    api.get(`/messages/${roomId}`)
      .then(res => setMessages(res.data))
      .catch(() => {})
      .finally(() => setLoadingMessages(false));
    api.put(`/messages/mark-read/${roomId}`).catch(() => {});
  }, [activeUser, user._id, socket]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg) => {
      // Ignore messages sent by self (already added via API response)
      const senderId = msg.sender?._id || msg.senderId;
      if (senderId === user._id) return;
      if (activeUser && msg.roomId === getRoomId(user._id, activeUser._id)) {
        setMessages(prev => [...prev, msg]);
      }
    };
    const handleTyping = (data) => {
      if (data.userId === activeUser?._id) {
        setTyping(true);
        setTimeout(() => setTyping(false), 2000);
      }
    };
    socket.on('receive_message', handleMessage);
    socket.on('user_typing', handleTyping);
    return () => {
      socket.off('receive_message', handleMessage);
      socket.off('user_typing', handleTyping);
    };
  }, [socket, activeUser, user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeUser) return;
    const roomId = getRoomId(user._id, activeUser._id);
    const text = input;
    setInput('');
    try {
      const res = await api.post('/messages', { roomId, receiverId: activeUser._id, content: text });
      // Add only once from API response
      setMessages(prev => [...prev, res.data]);
      // Emit to socket for receiver only (not self)
      socket?.emit('send_message', { ...res.data, roomId, senderId: user._id });
    } catch {
      setInput(text); // restore on error
    }
  };

  const handleTyping = () => {
    if (!activeUser) return;
    socket?.emit('typing', { roomId: getRoomId(user._id, activeUser._id), userId: user._id });
  };

  const isOnline = (uid) => onlineUsers.includes(uid);

  const Avatar = ({ u, size = 40 }) => {
    const bg = `hsl(${(u?.name?.charCodeAt(0) || 65) * 5 % 360}, 60%, 45%)`;
    return u?.avatar
      ? <img src={u.avatar} alt="" className="avatar" style={{ width: size, height: size }} />
      : <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: bg }}>
          {u?.name?.[0]?.toUpperCase()}
        </div>;
  };

  // Build sidebar list: connectedUsers + conversation users (merged, no duplicates)
  const conversationUserIds = new Set();
  const conversationMap = {};
  conversations.forEach(msg => {
    const other = msg.sender?._id === user._id ? msg.receiver : msg.sender;
    if (other?._id) {
      conversationUserIds.add(other._id);
      conversationMap[other._id] = { user: other, lastMsg: msg.content };
    }
  });

  // Sidebar entries: connected users first, then any leftover conversation users
  const sidebarUsers = [];
  connectedUsers.forEach(u => {
    sidebarUsers.push({
      user: u,
      lastMsg: conversationMap[u._id]?.lastMsg || null,
      isConnected: true
    });
    conversationUserIds.delete(u._id);
  });
  conversationUserIds.forEach(uid => {
    if (conversationMap[uid]) {
      sidebarUsers.push({ user: conversationMap[uid].user, lastMsg: conversationMap[uid].lastMsg, isConnected: false });
    }
  });

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{
        width: 300, minWidth: 280, borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', background: 'var(--bg-card)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Messages</h2>
          <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>{sidebarUsers.length} conversation{sidebarUsers.length !== 1 ? 's' : ''}</p>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {sidebarUsers.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-dim)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No conversations yet</div>
              <div style={{ fontSize: 12, lineHeight: 1.6 }}>
                Accept a swap request from<br />
                <span style={{ color: 'var(--primary-light)' }}>Matches page</span> to start chatting
              </div>
            </div>
          ) : (
            sidebarUsers.map(({ user: u, lastMsg, isConnected }) => {
              const isActive = activeUser?._id === u._id;
              return (
                <div
                  key={u._id}
                  onClick={() => setActiveUser(u)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', cursor: 'pointer',
                    background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                    borderLeft: `3px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <Avatar u={u} size={42} />
                    {isOnline(u._id) && (
                      <div style={{
                        position: 'absolute', bottom: 1, right: 1,
                        width: 10, height: 10, borderRadius: '50%',
                        background: 'var(--success)', border: '2px solid var(--bg-card)'
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{u.name}</span>
                      {isConnected && !lastMsg && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {lastMsg || (isConnected ? '✅ Swap accepted — say hello!' : 'No messages yet')}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {activeUser ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat header */}
          <div style={{
            padding: '14px 24px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--bg-card)', flexShrink: 0
          }}>
            <div style={{ position: 'relative' }}>
              <Avatar u={activeUser} size={40} />
              {isOnline(activeUser._id) && (
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', border: '2px solid var(--bg-card)' }} />
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{activeUser.name}</div>
              <div style={{ fontSize: 12, color: isOnline(activeUser._id) ? 'var(--success)' : 'var(--text-dim)' }}>
                {isOnline(activeUser._id) ? '● Online now' : '○ Offline'}
              </div>
            </div>
            <a
              href={`https://meet.jit.si/skillswap-${getRoomId(user._id, activeUser._id)}`}
              target="_blank" rel="noopener noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 'auto' }}
            >
              🎥 Video Call
            </a>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loadingMessages ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" style={{ width: 32, height: 32 }} />
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>👋</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Start the conversation!</div>
                <div style={{ fontSize: 13 }}>Say hi to {activeUser.name} and plan your first skill swap session</div>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMine = (msg.sender?._id || msg.senderId) === user._id;
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', gap: 8, alignItems: 'flex-end' }}>
                    {!isMine && <Avatar u={msg.sender || activeUser} size={28} />}
                    <div style={{
                      maxWidth: '65%',
                      padding: '10px 14px',
                      borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMine ? 'var(--primary)' : 'var(--bg-card)',
                      border: isMine ? 'none' : '1px solid var(--border)',
                      fontSize: 14, lineHeight: 1.5,
                      wordBreak: 'break-word'
                    }}>
                      {msg.content}
                      <div style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.5)' : 'var(--text-dim)', marginTop: 4, textAlign: 'right' }}>
                        {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'just now'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar u={activeUser} size={28} />
                <div style={{ padding: '10px 14px', background: 'var(--bg-card)', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-dim)', animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div style={{
            padding: '14px 24px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 10, background: 'var(--bg-card)', flexShrink: 0
          }}>
            <input
              className="input"
              placeholder={`Message ${activeUser.name}...`}
              value={input}
              onChange={e => { setInput(e.target.value); handleTyping(); }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              style={{ flex: 1 }}
              autoFocus
            />
            <button
              onClick={sendMessage}
              className="btn btn-primary"
              disabled={!input.trim()}
            >
              Send ➤
            </button>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 64 }}>💬</div>
          <h2 style={{ fontSize: 22 }}>Your Messages</h2>
          <p style={{ fontSize: 14, color: 'var(--text-dim)', textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
            Select a person from the left sidebar, or go to <span style={{ color: 'var(--primary-light)' }}>Matches</span> page and click "💬 Chat" on an accepted swap
          </p>
        </div>
      )}
    </div>
  );
}