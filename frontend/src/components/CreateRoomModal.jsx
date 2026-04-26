import { useState } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiX, FiCheck } from 'react-icons/fi';

function getInitials(name) {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
}

export default function CreateRoomModal({ allUsers, onClose, onCreated }) {
  const [roomName, setRoomName] = useState('');
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const toggleUser = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreate = async () => {
    if (!roomName.trim()) return toast.error('Please enter a room name');
    if (selected.length === 0) return toast.error('Select at least one member');
    setLoading(true);
    try {
      const { data } = await api.post('/api/rooms', { name: roomName.trim(), members: selected });
      onCreated(data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const filtered = allUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h3 className="modal-title">Create Group Room</h3>
          <button className="icon-btn" onClick={onClose}><FiX /></button>
        </div>
        <p className="modal-subtitle">Give your group a name and add members</p>

        <div className="form-group">
          <label className="form-label">Room Name</label>
          <input
            id="room-name-input"
            className="form-input"
            placeholder="e.g. Study Group, Team Alpha..."
            value={roomName}
            onChange={e => setRoomName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            Add Members
            {selected.length > 0 && (
              <span style={{ marginLeft: '8px', background: 'var(--accent)', color: '#fff', borderRadius: '20px', padding: '1px 8px', fontSize: '11px' }}>
                {selected.length} selected
              </span>
            )}
          </label>
          <input
            className="form-input"
            placeholder="Search members..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: '6px' }}
          />
          <div className="member-select-list">
            {filtered.map(u => (
              <div key={u._id} id={`member-${u._id}`} className="member-item" onClick={() => toggleUser(u._id)}>
                <div className={`member-checkbox ${selected.includes(u._id) ? 'checked' : ''}`}>
                  {selected.includes(u._id) && <FiCheck size={11} color="#fff" />}
                </div>
                <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{getInitials(u.name)}</div>
                <span style={{ fontSize: '14px' }}>{u.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button id="create-room-btn" className="btn-accent" onClick={handleCreate} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
}
