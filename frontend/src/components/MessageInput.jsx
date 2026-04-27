import { useState, useRef, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiSend, FiImage, FiX, FiSmile } from 'react-icons/fi';
import EmojiPicker from 'emoji-picker-react';

export default function MessageInput({ room, onSend }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);
  const fileRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Cleanup preview URL on unmount
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const emitTyping = useCallback(() => {
    if (!socket || !room) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { roomId: room._id, userName: user.name });
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stop-typing', { roomId: room._id });
    }, 2000);
  }, [socket, room, user]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !imageFile) return;

    // Check socket connection
    if (!socket || !socket.connected) {
      toast.error('Not connected. Please refresh the page.');
      console.error('❌ Socket not connected:', { hasSocket: !!socket, connected: socket?.connected });
      return;
    }

    // Stop typing
    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    socket?.emit('stop-typing', { roomId: room._id });

    if (imageFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('image', imageFile);
        const { data } = await api.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('📤 Sending message with image');
        onSend({ text: trimmed, imageUrl: data.imageUrl });
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Image upload failed');
        setUploading(false);
        return;
      }
      setUploading(false);
      setImageFile(null);
      setPreview('');
    } else {
      console.log('📤 Sending text message:', trimmed.substring(0, 20));
      onSend({ text: trimmed });
    }
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPG and PNG images allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const removeImage = () => {
    setImageFile(null);
    if (preview) { URL.revokeObjectURL(preview); setPreview(''); }
  };

  const onEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="msg-input-area">
      {preview && (
        <div className="img-preview-row">
          <img src={preview} className="img-preview-thumb" alt="preview" />
          <button className="img-preview-remove" onClick={removeImage} title="Remove"><FiX size={13} /></button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{imageFile?.name}</span>
        </div>
      )}
      
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} style={{ position: 'absolute', bottom: '70px', right: '24px', zIndex: 1000 }}>
          <EmojiPicker 
            onEmojiClick={onEmojiClick}
            theme="dark"
            width={320}
            height={400}
          />
        </div>
      )}
      
      <div className="msg-input-wrap">
        <input
          type="file"
          accept="image/jpeg,image/png"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button className="img-btn" title="Share image (Coming soon)" onClick={() => toast.error('Image upload coming soon!')} disabled>
          <FiImage />
        </button>
        <button 
          className="img-btn" 
          title="Emoji" 
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{ color: showEmojiPicker ? 'var(--accent)' : 'var(--text-muted)' }}
        >
          <FiSmile />
        </button>
        <textarea
          id="message-input"
          className="msg-input"
          placeholder="Type a message..."
          value={text}
          rows={1}
          onChange={e => { setText(e.target.value); emitTyping(); }}
          onKeyDown={handleKeyDown}
        />
        <button
          id="send-btn"
          className="send-btn"
          onClick={handleSend}
          disabled={uploading || (!text.trim() && !imageFile)}
          title="Send"
        >
          {uploading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <FiSend />}
        </button>
      </div>
    </div>
  );
}
