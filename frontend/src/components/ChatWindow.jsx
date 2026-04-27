import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { FiArrowLeft, FiUsers, FiHash } from 'react-icons/fi';
import toast from 'react-hot-toast';

function getInitials(name) {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatWindow({ room, onBack }) {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const currentRoomRef = useRef(null);

  // Join room + load history when room changes
  useEffect(() => {
    if (!room || !socket) return;
    currentRoomRef.current = room._id;

    socket.emit('join-room', room._id);
    loadMessages(room._id);

    return () => {
      socket.emit('leave-room', room._id);
    };
  }, [room?._id, socket]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onReceive = (msg) => {
      if (msg.room === currentRoomRef.current || msg.room?._id === currentRoomRef.current) {
        setMessages(prev => [...prev, msg]);
      }
    };
    const onTyping = (name) => setTypingUser(name);
    const onStopTyping = () => setTypingUser('');

    socket.on('receive-message', onReceive);
    socket.on('user-typing', onTyping);
    socket.on('stop-typing', onStopTyping);
    socket.on('message-error', ({ message }) => toast.error(message));

    return () => {
      socket.off('receive-message', onReceive);
      socket.off('user-typing', onTyping);
      socket.off('stop-typing', onStopTyping);
      socket.off('message-error');
    };
  }, [socket]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const loadMessages = async (roomId) => {
    setLoading(true);
    setMessages([]);
    try {
      const { data } = await api.get(`/api/messages/${roomId}`);
      setMessages(data);
    } catch {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = useCallback(({ text, imageUrl }) => {
    if (!socket || !room) return;
    socket.emit('send-message', {
      roomId: room._id,
      senderId: user._id,
      text: text || '',
      imageUrl: imageUrl || '',
    });
  }, [socket, room, user]);

  if (!room) {
    return (
      <div className="chat-window">
        <div className="welcome-screen">
          <div className="welcome-icon">💬</div>
          <h2 className="welcome-title">Welcome to ChatterBox</h2>
          <p className="welcome-sub">Select a person or group from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  const getRoomName = () => {
    if (room.isGroupChat) return room.name;
    const other = room.members?.find(m => (m._id || m) !== user._id);
    return other?.name || 'Chat';
  };

  const getOtherUser = () => {
    if (room.isGroupChat) return null;
    return room.members?.find(m => (m._id || m) !== user._id);
  };

  const otherUser = getOtherUser();
  const isOtherOnline = otherUser && onlineUsers.includes(otherUser._id || otherUser);

  // Group consecutive messages from same sender
  const grouped = messages.reduce((acc, msg) => {
    const last = acc[acc.length - 1];
    const senderId = msg.sender?._id || msg.sender;
    if (last && (last[0].sender?._id || last[0].sender) === senderId) {
      last.push(msg);
    } else {
      acc.push([msg]);
    }
    return acc;
  }, []);

  return (
    <div className="chat-window">
      {/* Topbar */}
      <div className="chat-topbar">
        <button 
          className="icon-btn" 
          onClick={onBack} 
          title="Back"
          style={{ marginRight: '4px' }}
        >
          <FiArrowLeft />
        </button>

        {room.isGroupChat ? (
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-hover)', border: '1.5px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            #
          </div>
        ) : (
          <div className="avatar" style={{ width: 40, height: 40, fontSize: 15 }}>
            {otherUser?.avatar ? <img src={otherUser.avatar} alt={otherUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(otherUser?.name)}
          </div>
        )}

        <div className="chat-topbar-info">
          <p className="chat-topbar-name">{getRoomName()}</p>
          <p className={`chat-topbar-status${typingUser ? ' typing' : ''}`}>
            {typingUser
              ? `${typingUser} is typing...`
              : room.isGroupChat
                ? `${room.members?.length || 0} members`
                : isOtherOnline ? '🟢 Online' : '⚫ Offline'}
          </p>
        </div>

        {room.isGroupChat && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <FiUsers size={14} />
            {room.members?.length}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
            Loading messages...
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">👋</div>
            <p className="chat-empty-text">No messages yet. Say hello!</p>
          </div>
        )}

        {grouped.map((group, gi) => {
          const senderId = group[0].sender?._id || group[0].sender;
          const isOwn = senderId === user._id;
          const senderName = group[0].sender?.name || 'Unknown';

          return (
            <div key={gi} className={`msg-group ${isOwn ? 'own' : 'other'}`}>
              {!isOwn && room.isGroupChat && (
                <p className="msg-sender-name">{senderName}</p>
              )}
              {group.map((msg, mi) => (
                <div key={msg._id || mi} className="msg-bubble">
                  {msg.imageUrl ? (
                    <img
                      src={msg.imageUrl}
                      alt="shared"
                      className="msg-img"
                      onClick={() => window.open(msg.imageUrl, '_blank')}
                    />
                  ) : (
                    msg.text
                  )}
                  {mi === group.length - 1 && (
                    <div className="msg-time">{formatTime(msg.createdAt)}</div>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {typingUser && <TypingIndicator name={typingUser} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput room={room} onSend={handleSend} />
    </div>
  );
}
