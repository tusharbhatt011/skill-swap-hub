import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ConnectModal from '../components/ConnectModal';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const CATEGORIES = ['Technology','Design','Marketing','Business','Language','Music','Art','Writing','Photography','Cooking','Fitness','Finance','Teaching','Engineering','Science','Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const isOwnProfile = id === currentUser?._id;
  const [profileUser, setProfileUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [connectModal, setConnectModal] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${id}`);
        setProfileUser(res.data);
        setEditData(res.data);
        const revRes = await api.get(`/reviews/user/${id}`);
        setReviews(revRes.data);
      } catch { toast.error('Failed to load profile'); }
      finally { setLoading(false); }
    };
    fetchProfile();
  }, [id]);

  const saveProfile = async () => {
    try {
      const res = await api.put('/auth/update-profile', {
        name: editData.name, bio: editData.bio, location: editData.location,
        timezone: editData.timezone, skillsOffered: editData.skillsOffered,
        skillsWanted: editData.skillsWanted, avatar: editData.avatar,
        socialLinks: editData.socialLinks
      });
      setProfileUser(res.data);
      updateUser(res.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
  };

  const addSkill = (type) => {
    setEditData(d => ({ ...d, [type]: [...(d[type] || []), { name: '', category: 'Technology', level: 'Intermediate' }] }));
  };

  const updateSkill = (type, idx, field, value) => {
    const updated = [...editData[type]];
    updated[idx] = { ...updated[idx], [field]: value };
    setEditData(d => ({ ...d, [type]: updated }));
  };

  if (loading) return <div className="loading-screen"><div className="spinner" style={{ width: 48, height: 48 }}></div></div>;
  if (!profileUser) return <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>User not found</div>;

  const u = editing ? editData : profileUser;

  return (
    <div style={{ padding: '32px 0 80px' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Profile Header */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
              {u.avatar ? (
                <img src={u.avatar} alt="" className="avatar" style={{ width: 100, height: 100, fontSize: 36 }} />
              ) : (
                <div className="avatar" style={{ width: 100, height: 100, fontSize: 36, background: `hsl(${(u.name?.charCodeAt(0) || 50) * 5}, 60%, 45%)` }}>
                  {u.name?.[0]?.toUpperCase()}
                </div>
              )}
              {/* Points ring */}
              <div style={{ position: 'absolute', bottom: -6, right: -6, background: 'var(--accent)', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 800, color: 'white' }}>
                ⚡{u.points}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              {editing ? (
                <input className="input" value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }} />
              ) : (
                <h1 style={{ fontSize: 28, marginBottom: 6 }}>{u.name}</h1>
              )}

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                {u.location && <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>📍 {u.location}</span>}
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>⭐ {u.rating?.toFixed(1) || '0.0'} ({u.reviewCount} reviews)</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>🤝 {u.swapsCompleted} swaps</span>
              </div>

              {editing ? (
                <textarea className="textarea" value={editData.bio || ''} onChange={e => setEditData(d => ({ ...d, bio: e.target.value }))} placeholder="Write about yourself..." style={{ minHeight: 70 }} />
              ) : (
                u.bio && <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>{u.bio}</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {isOwnProfile ? (
                editing ? (
                  <>
                    <button onClick={() => setEditing(false)} className="btn btn-secondary btn-sm">Cancel</button>
                    <button onClick={saveProfile} className="btn btn-primary btn-sm">💾 Save</button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm">✏️ Edit Profile</button>
                )
              ) : (
                <button onClick={() => setConnectModal(true)} className="btn btn-primary">🤝 Connect</button>
              )}
            </div>
          </div>

          {/* Badges */}
          {u.badges?.length > 0 && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 10, letterSpacing: 1 }}>BADGES</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {u.badges.map((badge, i) => (
                  <div key={i} style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 13, fontWeight: 600, color: '#fcd34d' }}>
                    {badge.icon} {badge.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Skills Offered */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18 }}>🎓 Skills I Offer</h3>
              {editing && <button onClick={() => addSkill('skillsOffered')} className="btn btn-secondary btn-sm">+ Add</button>}
            </div>
            {(u.skillsOffered || []).map((skill, i) => (
              editing ? (
                <div key={i} style={{ background: 'var(--bg-card2)', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <input className="input" value={skill.name} onChange={e => updateSkill('skillsOffered', i, 'name', e.target.value)} placeholder="Skill name" style={{ fontSize: 13 }} />
                    <select className="select" value={skill.category} onChange={e => updateSkill('skillsOffered', i, 'category', e.target.value)} style={{ fontSize: 13 }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {LEVELS.map(l => (
                        <button key={l} type="button" onClick={() => updateSkill('skillsOffered', i, 'level', l)} style={{
                          padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 600,
                          cursor: 'pointer', border: '1px solid',
                          background: skill.level === l ? 'rgba(99,102,241,0.2)' : 'transparent',
                          borderColor: skill.level === l ? 'var(--primary)' : 'var(--border)',
                          color: skill.level === l ? 'var(--primary-light)' : 'var(--text-dim)'
                        }}>{l}</button>
                      ))}
                    </div>
                    <button onClick={() => setEditData(d => ({ ...d, skillsOffered: d.skillsOffered.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 16 }}>✕</button>
                  </div>
                </div>
              ) : (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{skill.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{skill.category}</div>
                  </div>
                  <span className="badge badge-primary">{skill.level}</span>
                </div>
              )
            ))}
            {(u.skillsOffered || []).length === 0 && !editing && (
              <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No skills listed yet</p>
            )}
          </div>

          {/* Skills Wanted */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18 }}>🌱 Skills I Want</h3>
              {editing && <button onClick={() => addSkill('skillsWanted')} className="btn btn-secondary btn-sm">+ Add</button>}
            </div>
            {(u.skillsWanted || []).map((skill, i) => (
              editing ? (
                <div key={i} style={{ background: 'var(--bg-card2)', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                    <input className="input" value={skill.name} onChange={e => updateSkill('skillsWanted', i, 'name', e.target.value)} placeholder="Skill name" style={{ fontSize: 13 }} />
                    <select className="select" value={skill.category} onChange={e => updateSkill('skillsWanted', i, 'category', e.target.value)} style={{ fontSize: 13 }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setEditData(d => ({ ...d, skillsWanted: d.skillsWanted.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14 }}>✕ Remove</button>
                </div>
              ) : (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{skill.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{skill.category}</div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: 'rgba(6,182,212,0.12)', color: '#67e8f9' }}>{skill.level}</span>
                </div>
              )
            ))}
            {(u.skillsWanted || []).length === 0 && !editing && (
              <p style={{ color: 'var(--text-dim)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No skills listed yet</p>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 20, marginBottom: 20 }}>⭐ Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? (
            <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '20px 0' }}>No reviews yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {reviews.map(review => (
                <div key={review._id} style={{ padding: 16, background: 'var(--bg-card2)', borderRadius: 12 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 14 }}>{review.reviewer?.name?.[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{review.reviewer?.name}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= review.rating ? '#f59e0b' : 'var(--text-dim)' }}>★</span>)}</div>
                        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {connectModal && (
        <ConnectModal targetUser={profileUser} onClose={() => setConnectModal(false)} />
      )}
    </div>
  );
}
