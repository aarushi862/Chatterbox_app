import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiX, FiRefreshCw } from 'react-icons/fi';

export default function InviteModal({ onClose }) {
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { generateLink(); }, []);

  const generateLink = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/invite/generate');
      setInviteUrl(data.inviteUrl);
    } catch {
      toast.error('Could not generate invite link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('✅ Link copied!');
    setTimeout(() => setCopied(false), 2500);
  };

  const waMessage = encodeURIComponent(`Hey! Join me on ChatterBox 💬 ${inviteUrl}`);
  const smsBody = encodeURIComponent(`Hey! Join me on ChatterBox - ${inviteUrl}`);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔗</div>
            <div>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Invite Friends</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>to ChatterBox</p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><FiX /></button>
        </div>

        <p className="modal-subtitle" style={{ marginBottom: 20 }}>
          Share your invite link via WhatsApp, SMS, or copy it directly
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <span className="spinner" />
            <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-muted)' }}>Generating link...</p>
          </div>
        ) : (
          <>
            {/* Share buttons */}
            <div className="invite-share-btns">
              <a
                href={`https://wa.me/?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="share-btn whatsapp"
                id="whatsapp-share-btn"
              >
                <span className="share-btn-icon">📱</span>
                <span>WhatsApp</span>
              </a>
              <a
                href={`sms:?body=${smsBody}`}
                className="share-btn sms"
                id="sms-share-btn"
              >
                <span className="share-btn-icon">💬</span>
                <span>SMS</span>
              </a>
            </div>

            {/* Divider */}
            <div className="divider">or copy link</div>

            {/* Link box */}
            <div className="invite-link-box">
              <span className="invite-link-text" id="invite-url-text">{inviteUrl}</span>
              <button
                id="copy-invite-btn"
                className={`copy-btn${copied ? ' copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            <button
              onClick={generateLink}
              style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer', marginTop: 4 }}
            >
              <FiRefreshCw size={11} /> Generate new link
            </button>
          </>
        )}

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
