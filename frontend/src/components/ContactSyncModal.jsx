import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiX, FiUsers, FiMessageCircle, FiSend, FiAlertCircle } from 'react-icons/fi';

function getInitials(name) {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
}

export default function ContactSyncModal({ onClose, onStartDM }) {
  const [step, setStep] = useState('permission'); // permission, syncing, results
  const [registered, setRegistered] = useState([]);
  const [unregistered, setUnregistered] = useState([]);
  const [stats, setStats] = useState(null);
  const [inviteCode, setInviteCode] = useState('');
  const [fallbackMode, setFallbackMode] = useState(false);
  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    // Generate invite link for unregistered users
    generateInviteLink();
  }, []);

  const generateInviteLink = async () => {
    try {
      const { data } = await api.post('/api/invite/generate');
      setInviteCode(data.inviteUrl);
    } catch (err) {
      console.error('Failed to generate invite link:', err);
    }
  };

  const checkContactPickerSupport = () => {
    return 'contacts' in navigator && 'ContactsManager' in window;
  };

  const handleSyncContacts = async () => {
    // Check if Contact Picker API is supported
    if (!checkContactPickerSupport()) {
      setFallbackMode(true);
      toast.error('Contact Picker not supported. Use manual entry.');
      return;
    }

    try {
      setStep('syncing');

      // Request contact access using Contact Picker API
      const contacts = await navigator.contacts.select(
        ['name', 'email', 'tel'],
        { multiple: true }
      );

      // Extract emails and phones from selected contacts
      const emails = [];
      const phones = [];
      const contactMap = new Map(); // Store contact info for later

      contacts.forEach(contact => {
        const name = contact.name?.[0] || 'Unknown';
        
        if (contact.email && contact.email.length > 0) {
          contact.email.forEach(email => {
            emails.push(email);
            contactMap.set(email, { name, type: 'email' });
          });
        }
        
        if (contact.tel && contact.tel.length > 0) {
          contact.tel.forEach(tel => {
            const cleanPhone = tel.replace(/\D/g, '');
            if (cleanPhone.length >= 10) {
              phones.push(cleanPhone);
              contactMap.set(cleanPhone, { name, type: 'phone' });
            }
          });
        }
      });

      if (emails.length === 0 && phones.length === 0) {
        toast.error('No contacts with email or phone found');
        setStep('permission');
        return;
      }

      // Send to backend for matching
      const { data } = await api.post('/api/contacts/sync', { emails, phones });

      // Enhance unregistered contacts with names from contact picker
      const enhancedUnregistered = data.unregistered.map(contact => {
        const key = contact.email || contact.phone;
        const contactInfo = contactMap.get(key);
        return {
          ...contact,
          name: contactInfo?.name || contact.name
        };
      });

      setRegistered(data.registered);
      setUnregistered(enhancedUnregistered);
      setStats(data.stats);
      setStep('results');

      // Store sync timestamp in localStorage
      localStorage.setItem('lastContactSync', Date.now().toString());
      localStorage.setItem('syncedContactsCount', data.stats.found.toString());

      toast.success(`Found ${data.stats.found} friends on ChatterBox!`);
    } catch (err) {
      console.error('Contact sync error:', err);
      
      if (err.name === 'SecurityError' || err.name === 'NotAllowedError') {
        toast.error('Contact access denied. Please grant permission.');
      } else {
        toast.error('Failed to sync contacts');
      }
      
      setStep('permission');
    }
  };

  const handleManualSync = async () => {
    if (!manualInput.trim()) {
      toast.error('Please enter phone numbers or emails');
      return;
    }

    setStep('syncing');

    try {
      // Parse comma-separated input
      const inputs = manualInput.split(',').map(s => s.trim()).filter(Boolean);
      const emails = inputs.filter(s => s.includes('@'));
      const phones = inputs.filter(s => !s.includes('@')).map(p => p.replace(/\D/g, ''));

      const { data } = await api.post('/api/contacts/sync', { emails, phones });

      setRegistered(data.registered);
      setUnregistered(data.unregistered);
      setStats(data.stats);
      setStep('results');

      localStorage.setItem('lastContactSync', Date.now().toString());
      localStorage.setItem('syncedContactsCount', data.stats.found.toString());

      toast.success(`Found ${data.stats.found} friends on ChatterBox!`);
    } catch (err) {
      toast.error('Failed to sync contacts');
      setStep('permission');
    }
  };

  const handleStartDM = (user) => {
    onStartDM(user);
    toast.success(`Opening chat with ${user.name}`);
    onClose();
  };

  const handleInvite = (contact) => {
    const phone = contact.phone?.replace(/\D/g, '');
    const name = contact.name || 'friend';
    const message = `Hey ${name}! Join me on ChatterBox 💬 ${inviteCode}`;
    
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
      toast.success(`Invite sent to ${name}`);
    } else {
      // Fallback to generic WhatsApp share
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      toast.success('Opening WhatsApp...');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0, 0, 0, 0.85)' }}>
      <div 
        className="modal" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: 500, 
          background: '#0a0a0a',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ 
              width: 40, 
              height: 40, 
              background: 'rgba(34, 197, 94, 0.15)', 
              border: '2px solid #22C55E', 
              borderRadius: 12, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: 20 
            }}>
              <FiUsers color="#22C55E" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
                Sync Contacts
              </h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                Find friends on ChatterBox
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {/* Permission Step */}
          {step === 'permission' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                background: 'rgba(34, 197, 94, 0.1)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                border: '2px solid rgba(34, 197, 94, 0.3)'
              }}>
                <FiUsers size={36} color="#22C55E" />
              </div>
              
              <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#fff' }}>
                Find Your Friends
              </h4>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 24, lineHeight: 1.5 }}>
                ChatterBox would like to access your contacts to help you find friends who are already using the app
              </p>

              {!fallbackMode ? (
                <>
                  <button
                    onClick={handleSyncContacts}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      background: '#22C55E',
                      color: '#000',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginBottom: 12
                    }}
                  >
                    <FiUsers size={16} />
                    Sync Contacts
                  </button>

                  <button
                    onClick={() => setFallbackMode(true)}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      background: 'transparent',
                      color: 'rgba(255,255,255,0.6)',
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    Enter Manually
                  </button>
                </>
              ) : (
                <div>
                  <div style={{ 
                    background: 'rgba(34, 197, 94, 0.05)', 
                    border: '1px solid rgba(34, 197, 94, 0.2)', 
                    borderRadius: 8, 
                    padding: 12, 
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'start',
                    gap: 8
                  }}>
                    <FiAlertCircle size={16} color="#22C55E" style={{ marginTop: 2, flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, textAlign: 'left' }}>
                      Contact Picker not supported on this browser. Enter phone numbers or emails manually.
                    </p>
                  </div>

                  <textarea
                    className="form-input"
                    placeholder="Enter phone numbers or emails separated by comma&#10;Example: +1234567890, friend@email.com, +9876543210"
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    rows={4}
                    style={{ 
                      resize: 'none', 
                      borderRadius: 10, 
                      marginBottom: 12,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff'
                    }}
                  />

                  <button
                    onClick={handleManualSync}
                    style={{
                      width: '100%',
                      padding: '14px 24px',
                      background: '#22C55E',
                      color: '#000',
                      borderRadius: 10,
                      fontSize: 14,
                      fontWeight: 700
                    }}
                  >
                    Find Friends
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Syncing Step */}
          {step === 'syncing' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="spinner" style={{ 
                width: 48, 
                height: 48, 
                borderWidth: 4, 
                borderTopColor: '#22C55E',
                margin: '0 auto 20px'
              }} />
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                Finding your friends...
              </p>
            </div>
          )}

          {/* Results Step */}
          {step === 'results' && (
            <div>
              {/* Stats */}
              {stats && (
                <div style={{ 
                  background: 'rgba(34, 197, 94, 0.1)', 
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: 10, 
                  padding: 16, 
                  marginBottom: 20,
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#22C55E', margin: 0 }}>
                    {stats.found}
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                    friends found on ChatterBox!
                  </p>
                </div>
              )}

              {/* Registered Users */}
              {registered.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <p style={{ 
                    fontSize: 11, 
                    fontWeight: 700, 
                    color: '#22C55E', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px', 
                    marginBottom: 12 
                  }}>
                    Friends Already on ChatterBox
                  </p>
                  {registered.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 0',
                        borderBottom: idx < registered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                      }}
                    >
                      <div style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '50%', 
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '2px solid #22C55E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#22C55E',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        {item.user.avatar ? (
                          <img src={item.user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          getInitials(item.user.name)
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>
                          {item.user.name}
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                          {item.user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleStartDM(item.user)}
                        style={{
                          padding: '8px 16px',
                          background: '#22C55E',
                          color: '#000',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexShrink: 0
                        }}
                      >
                        <FiMessageCircle size={14} />
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Unregistered Contacts */}
              {unregistered.length > 0 && (
                <div>
                  <p style={{ 
                    fontSize: 11, 
                    fontWeight: 700, 
                    color: 'rgba(255,255,255,0.5)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px', 
                    marginBottom: 12 
                  }}>
                    Invite to ChatterBox
                  </p>
                  {unregistered.slice(0, 10).map((contact, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 0',
                        borderBottom: idx < Math.min(unregistered.length, 10) - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                      }}
                    >
                      <div style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '50%', 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.4)',
                        flexShrink: 0
                      }}>
                        {getInitials(contact.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                          {contact.name}
                        </p>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                          {contact.phone || contact.email}
                        </p>
                      </div>
                      <button
                        onClick={() => handleInvite(contact)}
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#22C55E',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: 700,
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          flexShrink: 0
                        }}
                      >
                        <FiSend size={14} />
                        Invite
                      </button>
                    </div>
                  ))}
                  {unregistered.length > 10 && (
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12, textAlign: 'center' }}>
                      +{unregistered.length - 10} more contacts
                    </p>
                  )}
                </div>
              )}

              {registered.length === 0 && unregistered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                    No matches found
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'results' && (
          <div style={{ 
            marginTop: 20, 
            paddingTop: 16, 
            borderTop: '1px solid rgba(255,255,255,0.1)' 
          }}>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.7)',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
