import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  const Avatar = ({ size = 36 }) => (
    user?.avatar
      ? <img src={user.avatar} alt={user.name} className="avatar" style={{ width: size, height: size }} />
      : <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
  );

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15,15,26,0.95)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 24 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>🔄</div>
          <span style={{ fontSize: 18, fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--text)' }}>
            Skill<span className="gradient-text">Swap</span>
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-2" style={{ marginLeft: 16 }}>
            {[
              { path: '/marketplace', label: 'Explore' },
              { path: '/matches', label: 'Matches' },
              { path: '/messages', label: 'Messages' },
              { path: '/leaderboard', label: 'Leaderboard' },
            ].map(link => (
              <Link key={link.path} to={link.path} style={{
                textDecoration: 'none', padding: '6px 14px', borderRadius: 8,
                fontSize: 14, fontWeight: 500,
                color: isActive(link.path) ? 'var(--primary-light)' : 'var(--text-muted)',
                background: isActive(link.path) ? 'rgba(99,102,241,0.12)' : 'transparent',
                transition: 'all 0.2s',
              }}>{link.label}</Link>
            ))}
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 20,
                background: 'rgba(245,158,11,0.12)',
                fontSize: 13, fontWeight: 600, color: '#fcd34d'
              }}>
                ⚡ {user.points}
              </div>
              <div style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <Avatar />
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>▼</span>
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 8,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: 8, minWidth: 180,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    zIndex: 200
                  }}>
                    {[
                      { to: `/profile/${user._id}`, label: '👤 My Profile' },
                      { to: '/dashboard', label: '📊 Dashboard' },
                      ...(user.isAdmin ? [{ to: '/admin', label: '🔧 Admin' }] : []),
                    ].map(item => (
                      <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} style={{
                        display: 'block', padding: '10px 14px', borderRadius: 8,
                        color: 'var(--text-muted)', textDecoration: 'none',
                        fontSize: 14, transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(99,102,241,0.1)'; e.target.style.color = 'var(--text)'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-muted)'; }}
                      >{item.label}</Link>
                    ))}
                    <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                    <button onClick={handleLogout} style={{
                      width: '100%', textAlign: 'left', padding: '10px 14px', borderRadius: 8,
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--danger)', fontSize: 14
                    }}>🚪 Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Join Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
