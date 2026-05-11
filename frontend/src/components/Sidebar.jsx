import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Icons (inline SVG for zero external deps)
const icons = {
  dashboard: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  ),
  projects: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4a1 1 0 011-1h10a1 1 0 011 1v9a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" />
      <path d="M5 3V2M11 3V2M2 7h12" />
    </svg>
  ),
  tasks: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 4h12M2 8h8M2 12h6" />
      <circle cx="13" cy="11" r="2" />
      <path d="M12 11l.5.5 1-1" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3" />
      <path d="M2 14c0-3 2-5 6-5s6 2 6 5" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M11 11l3-3-3-3M14 8H6" />
    </svg>
  ),
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    { to: '/projects', label: 'Projects', icon: icons.projects },
    { to: '/tasks', label: 'My Tasks', icon: icons.tasks },
    { to: '/profile', label: 'Profile', icon: icons.profile },
  ];

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">T</div>
        <span className="sidebar-workspace">TaskManager</span>
      </div>

      {/* Navigation */}
      <div style={{ padding: '8px 0', flex: 1 }}>
        <div className="sidebar-section-label">Navigation</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* User Footer */}
      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <button
          className="btn-icon"
          onClick={handleLogout}
          title="Logout"
          style={{ marginLeft: 'auto', flexShrink: 0 }}
        >
          {icons.logout}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
