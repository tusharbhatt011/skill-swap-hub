import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const STATUS_COLORS = { pending: '#f59e0b', accepted: '#10b981', rejected: '#ef4444', completed: '#6366f1', cancelled: '#64748b' };
const STATUS_ICONS = { pending: '⏳', accepted: '✅', rejected: '❌', completed: '🏆', cancelled: '🚫' };

export default function Matches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await api.get('/matches', { params });
      setMatches(res.data);
    } catch { toast.error('Failed to load matches'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMatches(); }, [filter]);

  const respond = async (matchId, status) => {
    try {
      await api.put(`/matches/${matchId}/respond`, { status });
      toast.success(status === 'accepted' ? 'Swap accepted! 🎉' : 'Request declined');
      fetchMatches();
    } catch { toast.error('Failed to respond'); }
  };

  const complete = async (matchId) => {
    try {
      await api.put(`/matches/${matchId}/complete`);
      toast.success('Swap completed! You earned 50 points! ⚡');
      fetchMatches();
    } catch { toast.error('Failed to complete'); }
  };

  const submitReview = async (match) => {
    try {
      const revieweeId = match.requester._id === user._id ? match.receiver._id : match.requester._id;
      await api.post('/reviews', { revieweeId, swapId: match._id, ...reviewData, skillSwapped: match.requesterSkill });
      toast.success('Review submitted! ⭐');
      setReviewTarget(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
  };

  const Avatar = ({ u, size = 40 }) => (
    u?.avatar
      ? <img src={u.avatar} alt="" className="avatar" style={{ width: size, height: size }} />
      : <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4, background: `hsl(${(u?.name?.charCodeAt(0) || 50) * 5}, 60%, 45%)` }}>{u?.name?.[0]}</div>
  );

  const filters = ['all', 'pending', 'accepted', 'completed'];

  return (
    <div style={{ padding: '32px 0 80px' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>My Swap Requests</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 28 }}>Manage your skill exchange requests</p>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 28 }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: filter === f ? 'var(--primary)' : 'transparent',
              color: filter === f ? 'white' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, textTransform: 'capitalize', transition: 'all 0.2s'
            }}>{STATUS_ICONS[f] || '📋'} {f}</button>
          ))}
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" style={{ width: 40, height: 40 }}></div></div>
        ) : matches.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🤝</div>
            <h3>No swap requests yet</h3>
            <p>Browse the marketplace to find your first skill swap partner!</p>
            <Link to="/marketplace" className="btn btn-primary" style={{ marginTop: 20 }}>Explore Marketplace</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {matches.map(match => {
              const isRequester = match.requester._id === user._id;
              const other = isRequester ? match.receiver : match.requester;
              return (
                <div key={match._id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <Avatar u={other} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <Link to={`/profile/${other._id}`} style={{ fontWeight: 700, color: 'var(--text)', textDecoration: 'none', fontSize: 16 }}>
                          {other.name}
                        </Link>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20, background: `${STATUS_COLORS[match.status]}20`, color: STATUS_COLORS[match.status] }}>
                          {STATUS_ICONS[match.status]} {match.status.toUpperCase()}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 'auto' }}>
                          {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <div style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', fontSize: 12 }}>
                          {isRequester ? '📤 You teach:' : '📥 They teach:'} <strong>{match.requesterSkill}</strong>
                        </div>
                        <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>⇄</div>
                        <div style={{ padding: '4px 12px', borderRadius: 8, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', fontSize: 12 }}>
                          {isRequester ? '📥 You learn:' : '📤 They learn:'} <strong>{match.receiverSkill}</strong>
                        </div>
                      </div>

                      {match.message && (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 12 }}>"{match.message}"</p>
                      )}

                      {match.meetingLink && (
                        <a href={match.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ marginBottom: 12 }}>
                          🎥 Join Meeting
                        </a>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {!isRequester && match.status === 'pending' && (
                          <>
                            <button onClick={() => respond(match._id, 'accepted')} className="btn btn-success btn-sm">✅ Accept</button>
                            <button onClick={() => respond(match._id, 'rejected')} className="btn btn-danger btn-sm">❌ Decline</button>
                          </>
                        )}
                        {match.status === 'accepted' && (
                          <>
                            <button onClick={() => complete(match._id)} className="btn btn-primary btn-sm">🏆 Mark Complete</button>
                            <Link to="/messages" className="btn btn-secondary btn-sm">💬 Chat</Link>
                          </>
                        )}
                        {match.status === 'completed' && (
                          <button onClick={() => setReviewTarget(match)} className="btn btn-secondary btn-sm">⭐ Write Review</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setReviewTarget(null)}>
          <div className="modal">
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>⭐ Write a Review</h2>
            <div className="form-group">
              <label className="label">Rating</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={() => setReviewData(d => ({ ...d, rating: r }))} style={{
                    fontSize: 28, background: 'none', border: 'none', cursor: 'pointer',
                    color: r <= reviewData.rating ? '#f59e0b' : 'var(--text-dim)',
                    transition: 'transform 0.1s'
                  }}>★</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="label">Comment</label>
              <textarea className="textarea" value={reviewData.comment} onChange={e => setReviewData(d => ({ ...d, comment: e.target.value }))} placeholder="Share your experience..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewTarget(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => submitReview(reviewTarget)} className="btn btn-primary" style={{ flex: 1 }}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
