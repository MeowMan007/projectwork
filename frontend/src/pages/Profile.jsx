import { useAuth } from '../context/AuthContext';
import AppLayout from '../layouts/AppLayout';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const fields = [
    { label: 'Full Name', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Role', value: user.role },
  ];

  return (
    <AppLayout title="Profile">
      <div style={{ maxWidth: 540 }}>
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>{user.name}</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{user.email}</p>
              <span
                style={{
                  display: 'inline-block', marginTop: 6,
                  padding: '2px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 600,
                  background: user.role === 'ADMIN' ? 'rgba(110,86,207,0.15)' : 'rgba(59,130,246,0.15)',
                  color: user.role === 'ADMIN' ? 'var(--accent-purple)' : 'var(--accent-blue)',
                }}
              >
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
            Account Details
          </h3>
          {fields.map((f) => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{f.value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>User ID</span>
            <span style={{ fontSize: 12, fontWeight: 500, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>{user.id?.slice(0, 16)}…</span>
          </div>
        </div>

        <div className="card" style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Permissions
          </h3>
          {user.role === 'ADMIN' ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Create & manage projects', 'Create, update & delete tasks', 'Add/remove project members', 'View all project statistics'].map((p) => (
                <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, color: 'var(--accent-green)', flexShrink: 0 }}>
                    <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['View assigned tasks', true],
                ['Update status of assigned tasks', true],
                ['View projects you are a member of', true],
                ['Create or delete projects', false],
                ['Manage other members\' tasks', false],
              ].map(([p, can]) => (
                <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: can ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                  <svg viewBox="0 0 16 16" fill="none" style={{ width: 14, height: 14, color: can ? 'var(--accent-green)' : 'var(--text-tertiary)', flexShrink: 0 }}>
                    {can
                      ? <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      : <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />}
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
