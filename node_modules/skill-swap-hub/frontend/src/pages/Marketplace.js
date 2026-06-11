import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import UserCard from '../components/UserCard';
import ConnectModal from '../components/ConnectModal';
import toast from 'react-hot-toast';

const CATEGORIES = ['All','Technology','Design','Marketing','Business','Language','Music','Art','Writing','Photography','Cooking','Fitness','Finance','Teaching','Engineering','Science','Other'];

export default function Marketplace() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [connectTarget, setConnectTarget] = useState(null);
  const [tab, setTab] = useState('browse');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (location) params.location = location;
      const res = await api.get('/users', { params });
      setUsers(res.data.users);
      setTotalPages(res.data.pages);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [search, category, location, page]);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await api.get('/users/matches');
      setMatches(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { if (tab === 'matches') fetchMatches(); }, [tab, fetchMatches]);

  return (
    <div style={{ padding: '32px 0 80px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Skill Marketplace</h1>
          <p style={{ color: 'var(--text-muted)' }}>Discover and connect with skilled people around the world</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 28 }}>
          {[{ id: 'browse', label: '🌐 Browse All' }, { id: 'matches', label: '🎯 My Matches' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: tab === t.id ? 'var(--primary)' : 'transparent',
              color: tab === t.id ? 'white' : 'var(--text-muted)',
              fontSize: 14, fontWeight: 600, transition: 'all 0.2s'
            }}>{t.label}</button>
          ))}
        </div>

        {/* Filters */}
        {tab === 'browse' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 28 }}>
            <input
              className="input" placeholder="🔍 Search skills or names..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <select className="select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              {CATEGORIES.map(c => <option key={c} value={c === 'All' ? '' : c}>{c}</option>)}
            </select>
            <input
              className="input" placeholder="📍 Filter by location..."
              value={location} onChange={e => { setLocation(e.target.value); setPage(1); }}
            />
          </div>
        )}

        {/* Category pills */}
        {tab === 'browse' && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {CATEGORIES.slice(0, 8).map(c => (
              <button key={c} onClick={() => { setCategory(c === 'All' ? '' : c); setPage(1); }} style={{
                padding: '5px 14px', borderRadius: 20, border: '1px solid',
                cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
                borderColor: (c === 'All' ? '' : c) === category ? 'var(--primary)' : 'var(--border)',
                background: (c === 'All' ? '' : c) === category ? 'rgba(99,102,241,0.12)' : 'transparent',
                color: (c === 'All' ? '' : c) === category ? 'var(--primary-light)' : 'var(--text-muted)'
              }}>{c}</button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="loading-screen"><div className="spinner" style={{ width: 40, height: 40 }}></div><p className="text-muted">Finding awesome people...</p></div>
        ) : tab === 'browse' ? (
          <>
            <div style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 14 }}>
              Showing {users.length} skill swappers
            </div>
            {users.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔍</div>
                <h3>No results found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-3">
                {users.map(u => (
                  <UserCard key={u._id} user={u} currentUser={user} onConnect={setConnectTarget} />
                ))}
              </div>
            )}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className="btn btn-secondary btn-sm" style={{
                    background: p === page ? 'var(--primary)' : undefined,
                    color: p === page ? 'white' : undefined
                  }}>{p}</button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div>
            {matches.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🎯</div>
                <h3>No matches yet</h3>
                <p>Add more skills to your profile to get matched!</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: 14 }}>
                  Found {matches.length} perfect matches for you!
                </div>
                <div className="grid grid-3">
                  {matches.map(({ user: matchUser, theyOfferWhatIWant, theyWantWhatIOffer }) => (
                    <div key={matchUser._id} style={{ position: 'relative' }}>
                      {(theyOfferWhatIWant > 0 && theyWantWhatIOffer > 0) && (
                        <div style={{
                          position: 'absolute', top: -10, right: 12, zIndex: 1,
                          background: 'var(--success)', color: 'white',
                          fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20
                        }}>MUTUAL MATCH 🔥</div>
                      )}
                      <UserCard user={matchUser} currentUser={user} onConnect={setConnectTarget} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {connectTarget && (
        <ConnectModal targetUser={connectTarget} onClose={() => setConnectTarget(null)} />
      )}
    </div>
  );
}
