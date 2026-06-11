import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = ['Account', 'Skills Offered', 'Skills Wanted'];
const CATEGORIES = ['Technology','Design','Marketing','Business','Language','Music','Art','Writing','Photography','Cooking','Fitness','Finance','Teaching','Engineering','Science','Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export default function Register() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', skillsOffered: [], skillsWanted: [] });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const addSkill = (type) => {
    setFormData(f => ({ ...f, [type]: [...f[type], { name: '', category: 'Technology', level: type === 'skillsOffered' ? 'Intermediate' : 'Beginner' }] }));
  };

  const updateSkill = (type, idx, field, value) => {
    const updated = [...formData[type]];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData(f => ({ ...f, [type]: updated }));
  };

  const removeSkill = (type, idx) => {
    setFormData(f => ({ ...f, [type]: f[type].filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      // Update profile with skills
      const api = (await import('../utils/api')).default;
      await api.put('/auth/update-profile', {
        skillsOffered: formData.skillsOffered.filter(s => s.name),
        skillsWanted: formData.skillsWanted.filter(s => s.name)
      });
      toast.success('Account created! Welcome to SkillSwap 🎉');
      navigate('/marketplace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const SkillForm = ({ type }) => (
    <div>
      {formData[type].map((skill, i) => (
        <div key={i} style={{ background: 'var(--bg-card2)', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'end' }}>
            <div>
              <label className="label">Skill Name</label>
              <input className="input" placeholder="e.g. React, Piano..." value={skill.name} onChange={e => updateSkill(type, i, 'name', e.target.value)} />
            </div>
            <div>
              <label className="label">Category</label>
              <select className="select" value={skill.category} onChange={e => updateSkill(type, i, 'category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={() => removeSkill(type, i)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <div style={{ marginTop: 10 }}>
            <label className="label">Level</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {LEVELS.map(l => (
                <button key={l} type="button" onClick={() => updateSkill(type, i, 'level', l)} style={{
                  padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: '1px solid',
                  background: skill.level === l ? 'rgba(99,102,241,0.2)' : 'transparent',
                  borderColor: skill.level === l ? 'var(--primary)' : 'var(--border)',
                  color: skill.level === l ? 'var(--primary-light)' : 'var(--text-dim)'
                }}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => addSkill(type)} className="btn btn-secondary" style={{ width: '100%' }}>
        + Add {type === 'skillsOffered' ? 'Another Skill' : 'Skill to Learn'}
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>Create Your Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join the skill sharing community</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                  background: i <= step ? 'var(--primary)' : 'var(--bg-card2)',
                  color: i <= step ? 'white' : 'var(--text-dim)',
                  border: `2px solid ${i <= step ? 'var(--primary)' : 'var(--border)'}`
                }}>{i + 1}</div>
                <span style={{ fontSize: 11, color: i <= step ? 'var(--primary-light)' : 'var(--text-dim)', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--primary)' : 'var(--border)', maxWidth: 60, marginBottom: 20 }} />}
            </React.Fragment>
          ))}
        </div>

        <div className="card">
          {step === 0 && (
            <div>
              <div className="form-group">
                <label className="label">Full Name</label>
                <input className="input" placeholder="Your name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Email</label>
                <input type="email" className="input" placeholder="you@example.com" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <input type="password" className="input" placeholder="Min. 6 characters" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-full" onClick={() => { if (!formData.name || !formData.email || !formData.password) { toast.error('Fill all fields'); return; } setStep(1); }}>
                Continue →
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>🎓 What can you teach?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Add skills you can offer to others</p>
              {formData.skillsOffered.length === 0 && <button type="button" onClick={() => addSkill('skillsOffered')} className="btn btn-secondary" style={{ width: '100%', marginBottom: 16 }}>+ Add Your First Skill</button>}
              <SkillForm type="skillsOffered" />
              <div className="flex gap-3 mt-4">
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setStep(2)}>Continue →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: 16, fontSize: 18 }}>🌱 What do you want to learn?</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>Add skills you're looking to acquire</p>
              {formData.skillsWanted.length === 0 && <button type="button" onClick={() => addSkill('skillsWanted')} className="btn btn-secondary" style={{ width: '100%', marginBottom: 16 }}>+ Add Skill to Learn</button>}
              <SkillForm type="skillsWanted" />
              <div className="flex gap-3 mt-4">
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? <><div className="spinner" style={{ width: 18, height: 18 }}></div> Creating...</> : '🚀 Join SkillSwap'}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
