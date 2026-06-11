import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matches').then(res => setMatches(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pending = matches.filter(m => m.status === 'pending').length;
  const accepted = matches.filter(m => m.status === 'accepted').length;
  const completed = matches.filter(m => m.status === 'completed').length;

  const NEXT_BADGE = user?.swapsCompleted < 1 ? { name: 'First Swap', icon: '🤝', needed: 1 }
    : user?.swapsCompleted < 5 ? { name: 'Swap Star', icon: '⭐', needed: 5 }
    : user?.swapsCompleted < 10 ? { name: 'Skill Master', icon: '🏆', needed: 10 }
    : { name: 'Legend', icon: '👑', needed: 20 };

  const progress = Math.min((user?.swapsCompleted / NEXT_BADGE.needed) * 100, 100);

  return (
    <div style={{ padding: '32px 0 80px' }}>
      <div className="container">
        {/* Welcome header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4 }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p style={{ color: 'var(--text-muted)' }}>Here's your skill swap activity overview</p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { icon: '⚡', label: 'Total Points', value: user?.points || 0, color: '#f59e0b' },
            { icon: '🤝', label: 'Swaps Done', value: user?.swapsCompleted || 0, color: '#10b981' },
            { icon: '⏳', label: 'Pending', value: pending, color: '#f59e0b' },
            { icon: '✅', label: 'Active', value: accepted, color: '#6366f1' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: stat.color, fontFamily: 'Space Grotesk' }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Next Badge Progress */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>🎯 Next Achievement</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 40 }}>{NEXT_BADGE.icon}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{NEXT_BADGE.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.swapsCompleted} / {NEXT_BADGE.needed} swaps</div>
              </div>
            </div>
            <div style={{ background: 'var(--bg-card2)', borderRadius: 20, height: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))', borderRadius: 20, transition: 'width 0.5s' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8 }}>
              {NEXT_BADGE.needed - (user?.swapsCompleted || 0)} more swap{NEXT_BADGE.needed - (user?.swapsCompleted || 0) !== 1 ? 's' : ''} to earn this badge
            </div>
          </div>

          {/* My Badges */}
          <div className="card">
            <h3 style={{ fontSize: 18, marginBottom: 16 }}>🏅 My Badges</h3>
            {user?.badges?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.badges.map((badge, i) => (
                  <div key={i} style={{ padding: '8px 14px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 13, fontWeight: 600, color: '#fcd34d' }}>
                    {badge.icon} {badge.name}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>Complete your first swap to earn a badge!</p>
            )}
          </div>

          {/* My Skills */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18 }}>🎓 Skills I Offer</h3>
              <Link to={`/profile/${user?._id}`} style={{ fontSize: 13, color: 'var(--primary-light)', textDecoration: 'none' }}>Edit →</Link>
            </div>
            {user?.skillsOffered?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {user.skillsOffered.map((s, i) => (
                  <span key={i} className="skill-tag">{s.name} • {s.level}</span>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
                <Link to={`/profile/${user?._id}`} style={{ color: 'var(--primary-light)' }}>Add skills</Link> you can teach others
              </p>
            )}
          </div>

          {/* Recent matches */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18 }}>📋 Recent Requests</h3>
              <Link to="/matches" style={{ fontSize: 13, color: 'var(--primary-light)', textDecoration: 'none' }}>View all →</Link>
            </div>
            {loading ? <div className="spinner" /> : matches.slice(0, 3).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {matches.slice(0, 3).map(m => {
                  const other = m.requester._id === user?._id ? m.receiver : m.requester;
                  return (
                    <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{other?.name?.[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{other?.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{m.requesterSkill} ⇄ {m.receiverSkill}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: m.status === 'completed' ? 'rgba(99,102,241,0.15)' : m.status === 'accepted' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: m.status === 'completed' ? '#a5b4fc' : m.status === 'accepted' ? '#6ee7b7' : '#fcd34d' }}>{m.status}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>No swap requests yet. <Link to="/marketplace" style={{ color: 'var(--primary-light)' }}>Find a partner!</Link></p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/marketplace" className="btn btn-primary">🔍 Find Skill Partners</Link>
          <Link to="/matches" className="btn btn-secondary">📋 View My Swaps</Link>
          <Link to="/leaderboard" className="btn btn-secondary">🏆 Leaderboard</Link>
        </div>
      </div>
    </div>
  );
}
