import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CATEGORIES = [
  { icon: '💻', name: 'Technology' }, { icon: '🎨', name: 'Design' },
  { icon: '📈', name: 'Marketing' }, { icon: '🗣️', name: 'Language' },
  { icon: '🎵', name: 'Music' }, { icon: '📸', name: 'Photography' },
  { icon: '✍️', name: 'Writing' }, { icon: '💰', name: 'Finance' },
];

const STATS = [
  { num: '10K+', label: 'Skill Swappers' },
  { num: '50K+', label: 'Skills Exchanged' },
  { num: '200+', label: 'Skill Categories' },
  { num: '98%', label: 'Satisfaction Rate' },
];

export default function Home() {
  const { user } = useAuth();
  const [popularSkills, setPopularSkills] = useState([]);

  useEffect(() => {
    api.get('/skills/popular').then(res => setPopularSkills(res.data.slice(0, 8))).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: '100px 0 80px', position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 60% 20%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(6,182,212,0.1) 0%, transparent 50%)'
      }}>
        {/* Floating orbs */}
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', top: -100, right: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)', bottom: 0, left: '20%', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 20, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: 24, fontSize: 13, color: 'var(--primary-light)' }}>
            ✨ The future of skill sharing is here
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-1px' }}>
            Exchange Skills,<br />
            <span className="gradient-text">Grow Together</span>
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Connect with people who have the skills you want, and teach them what you know. No money needed — just knowledge.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link to="/marketplace" className="btn btn-primary btn-lg">
                🔍 Explore Marketplace
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  🚀 Start Swapping Free
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Floating skill tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 48, opacity: 0.7 }}>
            {['React Dev', 'UI/UX Design', 'Piano', 'Spanish', 'Photography', 'SEO', 'Python', 'Yoga'].map(s => (
              <span key={s} className="skill-tag" style={{ fontSize: 13 }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '48px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32 }}>
            {STATS.map(s => (
              <div key={s.num} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'Space Grotesk' }} className="gradient-text">{s.num}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36 }}>How It Works</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 12, fontSize: 16 }}>Three simple steps to start your skill journey</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            {[
              { step: '01', icon: '📝', title: 'Create Your Profile', desc: 'List skills you can teach and skills you want to learn' },
              { step: '02', icon: '🎯', title: 'Get Matched', desc: 'Our algorithm finds your perfect skill swap partners' },
              { step: '03', icon: '🤝', title: 'Swap & Grow', desc: 'Schedule sessions, exchange knowledge, earn points' },
            ].map(item => (
              <div key={item.step} className="card" style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--primary)', marginBottom: 12 }}>{item.step}</div>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{item.icon}</div>
                <h3 style={{ marginBottom: 10, fontSize: 18 }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '0 0 80px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 32 }}>Browse by Category</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/marketplace?category=${cat.name}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ textAlign: 'center', padding: '24px 16px', cursor: 'pointer' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{cat.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{cat.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Skills */}
      {popularSkills.length > 0 && (
        <section style={{ padding: '0 0 80px' }}>
          <div className="container">
            <h2 style={{ fontSize: 28, marginBottom: 24 }}>🔥 Trending Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {popularSkills.map((skill, i) => (
                <div key={skill.name} style={{
                  padding: '8px 18px', borderRadius: 20,
                  background: `rgba(99,102,241,${0.08 + i * 0.01})`,
                  border: '1px solid rgba(99,102,241,0.2)',
                  color: 'var(--primary-light)', fontSize: 14, fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  {skill.name}
                  <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{skill.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {!user && (
        <section style={{ padding: '60px 0', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(6,182,212,0.08))', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 36, marginBottom: 16 }}>Ready to Start Swapping?</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 16, marginBottom: 32 }}>Join thousands of learners and teachers today. It's completely free.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account 🎉</Link>
          </div>
        </section>
      )}
    </div>
  );
}
