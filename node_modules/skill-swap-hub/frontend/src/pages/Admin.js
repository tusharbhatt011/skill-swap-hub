import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/'); return; }
    fetchStats();
    fetchUsers();
  }, [user, navigate]);

  const fetchStats = async () => {
    try { const res = await api.get('/admin/stats'); setStats(res.data); }
    catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try { const res = await api.get('/admin/users', { params: { search } }); setUsers(res.data.users); }
    catch {}
  };

  const toggleBan = async (userId, banned) => {
    try {
      await api.put(`/admin/users/${userId}/ban`, { banned: !banned });
      toast.success(banned ? 'User unbanned' : 'User banned');
      fetchUsers();
    } catch { toast.error('Failed to update user'); }
  };

  useEffect(() => { fetchUsers(); }, [search]);

  if (!user?.isAdmin) return null;

  return (
    <div style={{ padding: '32px 0 80px' }}>
      <div className="container">
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 28 }}>🔧 Admin Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Platform management and insights</p>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 28 }}>
          {[{id:'overview',label:'📊 Overview'},{id:'users',label:'👥 Users'}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'var(--primary)' : 'transparent',
              color: tab === t.id ? 'white' : 'var(--text-muted)',
              fontSize: 14, fontWeight: 600
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'overview' && stats && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { icon: '👥', label: 'Total Users', value: stats.totalUsers, color: '#6366f1' },
                { icon: '🤝', label: 'Total Swaps', value: stats.totalSwaps, color: '#06b6d4' },
                { icon: '✅', label: 'Completed', value: stats.completedSwaps, color: '#10b981' },
                { icon: '⭐', label: 'Reviews', value: stats.totalReviews, color: '#f59e0b' },
              ].map(s => (
                <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: 32, fontWeight: 800, color: s.color, fontFamily: 'Space Grotesk' }}>{s.value}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div className="card">
                <h3 style={{ fontSize: 18, marginBottom: 16 }}>🔥 Popular Skills</h3>
                {stats.popularSkills?.map(([name, count], i) => (
                  <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-dim)', width: 20 }}>#{i+1}</span>
                      <span style={{ fontSize: 14 }}>{name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 6, background: 'var(--bg-card2)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(count / (stats.popularSkills[0]?.[1] || 1)) * 100}%`, background: 'var(--primary)', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 24, textAlign: 'right' }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card">
                <h3 style={{ fontSize: 18, marginBottom: 16 }}>📍 Active Regions</h3>
                {stats.activeRegions?.length > 0 ? stats.activeRegions.map(([loc, count], i) => (
                  <div key={loc} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                    <span>{loc}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} users</span>
                  </div>
                )) : <p style={{ color: 'var(--text-dim)' }}>No location data yet</p>}
              </div>

              <div className="card">
                <h3 style={{ fontSize: 18, marginBottom: 16 }}>🆕 Recent Users</h3>
                {stats.recentUsers?.map(u => (
                  <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span>{u.name}</span>
                    <span style={{ color: 'var(--text-dim)' }}>{u.email}</span>
                  </div>
                ))}
              </div>

              <div className="card">
                <h3 style={{ fontSize: 18, marginBottom: 16 }}>✅ Recent Completions</h3>
                {stats.recentSwaps?.map(s => (
                  <div key={s._id} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span>{s.requester?.name}</span>
                    <span style={{ color: 'var(--text-dim)' }}>⇄</span>
                    <span>{s.receiver?.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'users' && (
          <>
            <input className="input" placeholder="🔍 Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 20, maxWidth: 400 }} />
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card2)' }}>
                    {['User', 'Email', 'Points', 'Swaps', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{u.name?.[0]}</div>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{u.name}</span>
                          {u.isAdmin && <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.15)', color: 'var(--primary-light)', padding: '1px 6px', borderRadius: 8 }}>ADMIN</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: '#fcd34d', fontWeight: 600 }}>{u.points}</td>
                      <td style={{ padding: '12px 16px', fontSize: 14 }}>{u.swapsCompleted}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: u.isBanned ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: u.isBanned ? 'var(--danger)' : 'var(--success)' }}>
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {!u.isAdmin && (
                          <button onClick={() => toggleBan(u._id, u.isBanned)} className={`btn btn-sm ${u.isBanned ? 'btn-success' : 'btn-danger'}`}>
                            {u.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
