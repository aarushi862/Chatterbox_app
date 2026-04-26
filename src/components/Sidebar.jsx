import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/axios';
import CreateRoomModal from './CreateRoomModal';
import InviteModal from './InviteModal';
import toast from 'react-hot-toast';
import { FiSearch, FiPlus, FiLogOut, FiUsers, FiUserPlus, FiMessageSquare } from 'react-icons/fi';

function getInitials(name) {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
}

function Avatar({ user }) {
  if (user?.avatar) return <div className="avatar"><img src={user.avatar} alt={user.name} /></div>;
  return <div className="avatar">{getInitials(user?.name)}</div>;
}

export default function Sidebar({ activeRoom, onSelectRoom }) {
  const { user, logout } = useAuth();
  const { onlineUsers } = useSocket();
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users');
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [dmLoading, setDmLoading] = useState(null);

  useEffect(() => { 
    fetchUsers(); 
    fetchRooms(); 
  }, []);

  const fetchUsers = async () => {
    try { const { data } = await api.get('/api/auth/users'); setUsers(data); }
    catch { toast.error('Failed to load users'); }
  };

  const fetchRooms = async () => {
    try { const { data } = await api.get('/api/rooms'); setRooms(data); }
    catch { toast.error('Failed to load rooms'); }
  };

  const handleUserClick = async (targetUser) => {
    setDmLoading(targetUser._id);
    try {
      const { data: room } = await api.post('/api/rooms/dm', { userId: targetUser._id });
      onSelectRoom(room);
    } catch { toast.error('Could not open conversation'); }
    finally { setDmLoading(null); }
  };

  const handleRoomCreated = (room) => {
    setRooms(prev => [room, ...prev]);
    setShowRoomModal(false);
    onSelectRoom(room);
    toast.success(`Room "${room.name}" created!`);
  };



  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  const filteredRooms = rooms.filter(r => r.name?.toLowerCase().includes(search.toLowerCase()));
  const onlineCount = users.filter(u => onlineUsers.includes(u._id)).length;

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">💬</div>
          <span className="sidebar-brand-name">ChatterBox</span>
        </div>
        <div className="sidebar-actions">
          <button id="invite-btn" className="icon-btn" title="Invite People" onClick={() => setShowInviteModal(true)}>
            <FiUserPlus />
          </button>
          <button id="create-room-open-btn" className="icon-btn" title="Create Group Room" onClick={() => setShowRoomModal(true)}>
            <FiPlus />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <div className="search-input-wrap">
          <FiSearch />
          <input className="search-input" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn${tab === 'users' ? ' active' : ''}`} onClick={() => setTab('users')}>
          <FiUsers size={13} /> People
        </button>
        <button className={`tab-btn${tab === 'rooms' ? ' active' : ''}`} onClick={() => setTab('rooms')}>
          <FiMessageSquare size={13} /> Groups
        </button>
      </div>

      {/* List */}
      <div className="sidebar-list">
        {tab === 'users' && (
          <>
            <p className="sidebar-section-title">{onlineCount > 0 ? `${onlineCount} online` : 'All people'}</p>
            {filteredUsers.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 16px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>No contacts yet</p>
                <button onClick={() => setShowInviteModal(true)} style={{ background: 'var(--accent)', color: '#000', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FiUserPlus size={14} /> Invite Someone
                </button>
              </div>
            )}
            {filteredUsers.map(u => {
              const isOnline = onlineUsers.includes(u._id);
              const isActive = activeRoom?.isGroupChat === false && activeRoom?.members?.some(m => (m._id || m) === u._id);
              return (
                <div key={u._id} id={`user-${u._id}`} className={`user-item${isActive ? ' active' : ''}`} onClick={() => handleUserClick(u)}>
                  <div className="avatar-wrap">
                    <Avatar user={u} />
                    <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
                  </div>
                  <div className="user-info">
                    <p className="user-name">{u.name}</p>
                    <p className={`user-status${isOnline ? ' is-online' : ''}`}>
                      {dmLoading === u._id ? 'Opening...' : isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {tab === 'rooms' && (
          <>
            <p className="sidebar-section-title">Group Rooms</p>
            {filteredRooms.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px 16px' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>No group rooms yet</p>
                <button onClick={() => setShowRoomModal(true)} style={{ background: 'var(--accent)', color: '#000', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FiPlus size={14} /> Create Room
                </button>
              </div>
            )}
            {filteredRooms.map(room => {
              const other = !room.isGroupChat ? room.members?.find(m => (m._id || m) !== user._id) : null;
              return (
                <div key={room._id} id={`room-${room._id}`} className={`room-item${activeRoom?._id === room._id ? ' active' : ''}`} onClick={() => onSelectRoom(room)}>
                  <div className="room-icon">💬</div>
                  <div className="room-info">
                    <p className="room-name">{room.isGroupChat ? room.name : (other?.name || 'Chat')}</p>
                    <p className="room-members">{room.isGroupChat ? `${room.members?.length || 0} members` : 'Direct Message'}</p>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="avatar avatar-sm">{getInitials(user?.name)}</div>
        <div className="me-info">
          <p className="me-name">{user?.name}</p>
          <p className="me-email">{user?.email}</p>
        </div>
        <button className="logout-btn" title="Logout" onClick={() => { logout(); toast.success('Logged out'); }}>
          <FiLogOut />
        </button>
      </div>

      {showRoomModal && <CreateRoomModal allUsers={users} onClose={() => setShowRoomModal(false)} onCreated={handleRoomCreated} />}
      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </aside>
  );
}
