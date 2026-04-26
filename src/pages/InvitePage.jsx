import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function InvitePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [inviteInfo, setInviteInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    validateCode();
  }, [code]);

  const validateCode = async () => {
    try {
      const { data } = await api.get(`/api/invite/validate/${code}`);
      setInviteInfo(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid invite link');
    } finally {
      setLoading(false);
    }
  };

  function getInitials(name) {
    return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill all fields');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setSubmitting(true);
    try {
      // Register the user
      await register(form.name, form.email, form.password);
      // Mark invite as used (best-effort)
      try { await api.post(`/api/invite/use/${code}`); } catch {}
      toast.success('Welcome to ChatterBox! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <span className="spinner" style={{ borderTopColor: 'var(--accent)', width: 28, height: 28 }} />
          <p style={{ marginTop: 14, color: 'var(--text-muted)', fontSize: 14 }}>Validating invite link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
          <h2 className="auth-title" style={{ marginBottom: 8 }}>Invalid Invite</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>{error}</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💬</div>
          <span className="auth-logo-text">ChatterBox</span>
        </div>
        <p className="auth-subtitle" style={{ marginBottom: 16 }}>You've been invited!</p>

        {inviteInfo?.invitedBy && (
          <div className="invite-banner">
            <div className="invite-banner-avatar">
              {inviteInfo.invitedBy.avatar
                ? <img src={inviteInfo.invitedBy.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : getInitials(inviteInfo.invitedBy.name)
              }
            </div>
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>{inviteInfo.invitedBy.name}</strong>
              {' '}invited you to join ChatterBox
            </span>
          </div>
        )}

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle" style={{ marginBottom: 24, fontSize: 13 }}>Fill in the details below to get started</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="inv-name" type="text" className="form-input" placeholder="Your name"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input id="inv-email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="inv-password" type="password" className="form-input" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input id="inv-confirm" type="password" className="form-input" placeholder="Repeat password"
              value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} />
          </div>
          <button id="inv-submit" type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? <span className="spinner" /> : 'Join ChatterBox'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} style={{ color: 'var(--accent-light)', fontWeight: 500, cursor: 'pointer' }}>
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
