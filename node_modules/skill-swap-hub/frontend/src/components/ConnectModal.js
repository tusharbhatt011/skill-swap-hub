import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ConnectModal = ({ targetUser, onClose }) => {
  const { user } = useAuth();
  const [mySkill, setMySkill] = useState('');
  const [theirSkill, setTheirSkill] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mySkill || !theirSkill) return toast.error('Please select skills for the swap');
    setLoading(true);
    try {
      await api.post('/matches/request', {
        receiverId: targetUser._id,
        requesterSkill: mySkill,
        receiverSkill: theirSkill,
        message
      });
      toast.success('Swap request sent! 🎉');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 20 }}>🤝 Request Skill Swap</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 20 }}>✕</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--bg-card2)', borderRadius: 12, marginBottom: 20 }}>
          <div className="avatar" style={{ width: 44, height: 44, fontSize: 18 }}>
            {targetUser.avatar ? <img src={targetUser.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : targetUser.name?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{targetUser.name}</div>
            <div className="text-sm text-muted">{targetUser.skillsOffered?.length} skills to offer</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">I'll teach (from my skills)</label>
            <select className="select" value={mySkill} onChange={e => setMySkill(e.target.value)} required>
              <option value="">Select a skill you offer...</option>
              {user.skillsOffered?.map((s, i) => (
                <option key={i} value={s.name}>{s.name} ({s.level})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">I want to learn (from their skills)</label>
            <select className="select" value={theirSkill} onChange={e => setTheirSkill(e.target.value)} required>
              <option value="">Select a skill they offer...</option>
              {targetUser.skillsOffered?.map((s, i) => (
                <option key={i} value={s.name}>{s.name} ({s.level})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Message (optional)</label>
            <textarea
              className="textarea"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Hi! I'd love to exchange skills with you..."
              style={{ minHeight: 80 }}
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width: 16, height: 16 }}></div> Sending...</> : '🚀 Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectModal;
