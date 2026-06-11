import React from 'react';
import { Link } from 'react-router-dom';

const Stars = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={`star ${i <= Math.round(rating) ? '' : 'empty'}`}>★</span>
    ))}
  </div>
);

const UserCard = ({ user, onConnect, currentUser }) => {
  const initial = user.name?.[0]?.toUpperCase();

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="flex items-center gap-3">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="avatar" style={{ width: 52, height: 52 }} />
        ) : (
          <div className="avatar" style={{
            width: 52, height: 52, fontSize: 20,
            background: `linear-gradient(135deg, hsl(${user.name.charCodeAt(0) * 5}, 70%, 50%), hsl(${user.name.charCodeAt(1) * 7}, 70%, 40%))`
          }}>{initial}</div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
          <div className="flex items-center gap-2 mt-1">
            <Stars rating={user.rating || 0} />
            <span className="text-xs text-dim">({user.reviewCount || 0})</span>
          </div>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fcd34d' }}>⚡{user.points}</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{user.swapsCompleted} swaps</div>
        </div>
      </div>

      {user.location && (
        <div className="text-sm text-muted">📍 {user.location}</div>
      )}

      {user.bio && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
        }}>{user.bio}</p>
      )}

      {user.skillsOffered?.length > 0 && (
        <div>
          <div className="text-xs text-dim font-semibold mb-2">OFFERS</div>
          <div className="flex flex-wrap gap-2">
            {user.skillsOffered.slice(0, 3).map((skill, i) => (
              <span key={i} className="skill-tag">{skill.name}</span>
            ))}
            {user.skillsOffered.length > 3 && (
              <span className="skill-tag">+{user.skillsOffered.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {user.skillsWanted?.length > 0 && (
        <div>
          <div className="text-xs text-dim font-semibold mb-2">WANTS TO LEARN</div>
          <div className="flex flex-wrap gap-2">
            {user.skillsWanted.slice(0, 3).map((skill, i) => (
              <span key={i} className="skill-tag skill-tag-wanted">{skill.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <Link to={`/profile/${user._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
          View Profile
        </Link>
        {onConnect && currentUser?._id !== user._id && (
          <button onClick={() => onConnect(user)} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
            🤝 Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
