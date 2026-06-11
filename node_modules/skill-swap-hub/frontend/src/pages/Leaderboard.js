import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard')
      .then(res => setLeaders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const MEDALS = ['🥇', '🥈', '🥉'];
  const myRank = leaders.findIndex(l => l._id === user?._id) + 1;

  return (
    <div style={{ padding: '32px 0 80px' }}>
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Leaderboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Top skill swappers in the community</p>
          {myRank > 0 && (
            <div style={{ marginTop: 16, padding: '10px 24px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', display: 'inline-block', color: 'var(--primary-light)', fontWeight: 600, fontSize: 14 }}>
              Your rank: #{myRank}
            </div>
          )}
        </div>

        {/* Top 3 podium */}
        {leaders.length >= 3 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, marginBottom: 40 }}>
            {[1, 0, 2].map((idx) => {
              const l = leaders[idx];
              const heights = [120, 150, 100];
              const isCenter = idx === 0;
              return (
                <Link key={l._id} to={`/profile/${l._id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 24 }}>{MEDALS[idx]}</div>
                  {l.avatar ? (
                    <img src={l.avatar} alt="" className="avatar" style={{ width: isCenter ? 68 : 52, height: isCenter ? 68 : 52 }} />
                  ) : (
                    <div className="avatar" style={{ width: isCenter ? 68 : 52, height: isCenter ? 68 : 52, fontSize: isCenter ? 26 : 20, background: `hsl(${(l.name?.charCodeAt(0) || 50) * 5}, 60%, 45%)` }}>
                      {l.name?.[0]}
                    </div>
                  )}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: isCenter ? 15 : 13, color: 'var(--text)' }}>{l.name.split(' ')[0]}</div>
                    <div style={{ fontSize: 12, color: '#fcd34d', fontWeight: 700 }}>⚡{l.points}</div>
                  </div>
                  <div style={{
                    width: isCenter ? 100 : 80, height: heights[idx],
                    background: isCenter
                      ? 'linear-gradient(180deg, rgba(245,158,11,0.3), rgba(245,158,11,0.1))'
                      : 'linear-gradient(180deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))',
                    border: `1px solid ${isCenter ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.2)'}`,
                    borderRadius: '8px 8px 0 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isCenter ? 28 : 22, fontWeight: 900,
                    color: isCenter ? '#fcd34d' : 'var(--text-muted)'
                  }}>#{idx + 1}</div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Full list */}
        {loading ? (
          <div className="loading-screen"><div className="spinner" style={{ width: 40, height: 40 }}></div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaders.map((l, i) => (
              <Link key={l._id} to={`/profile/${l._id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{
                  padding: '14px 20px',
                  background: l._id === user?._id ? 'rgba(99,102,241,0.08)' : 'var(--bg-card)',
                  borderColor: l._id === user?._id ? 'rgba(99,102,241,0.3)' : 'var(--border)',
                  display: 'flex', alignItems: 'center', gap: 16
                }}>
                  <div style={{ width: 32, textAlign: 'center', fontWeight: 700, fontSize: 14, color: i < 3 ? '#fcd34d' : 'var(--text-dim)' }}>
                    {i < 3 ? MEDALS[i] : `#${i + 1}`}
                  </div>
                  {l.avatar ? (
                    <img src={l.avatar} alt="" className="avatar" style={{ width: 40, height: 40 }} />
                  ) : (
                    <div className="avatar" style={{ width: 40, height: 40, fontSize: 16, background: `hsl(${(l.name?.charCodeAt(0) || 50) * 5}, 60%, 45%)` }}>
                      {l.name?.[0]}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{l.name} {l._id === user?._id && <span style={{ fontSize: 11, color: 'var(--primary-light)' }}>(You)</span>}</div>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-dim)' }}>
                      <span>🤝 {l.swapsCompleted} swaps</span>
                      {l.badges?.length > 0 && <span>{l.badges.slice(-2).map(b => b.icon).join(' ')}</span>}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#fcd34d' }}>⚡{l.points}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
