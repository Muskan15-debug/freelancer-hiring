import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  HiOutlineHome, HiOutlineBriefcase, HiOutlineDocumentText,
  HiOutlineChatAlt2, HiOutlineExclamationCircle, HiOutlineCreditCard,
  HiOutlineUser, HiOutlineUserGroup, HiOutlineSearch,
  HiOutlineChartBar, HiOutlineUsers, HiOutlineOfficeBuilding,
  HiOutlineLogout
} from 'react-icons/hi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.roles?.includes('admin');

  const navItems = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/projects', icon: HiOutlineBriefcase, label: 'Projects' },
    { to: '/contracts', icon: HiOutlineDocumentText, label: 'Contracts' },
    { to: '/messages', icon: HiOutlineChatAlt2, label: 'Messages' },
    { to: '/disputes', icon: HiOutlineExclamationCircle, label: 'Disputes' },
    { to: '/payments', icon: HiOutlineCreditCard, label: 'Payments' },
  ];

  const discoverItems = [
    { to: '/talent', icon: HiOutlineSearch, label: 'Find Talent' },
    { to: '/agency', icon: HiOutlineOfficeBuilding, label: 'Agency' },
  ];

  const adminItems = [
    { to: '/admin', icon: HiOutlineChartBar, label: 'Analytics' },
    { to: '/admin/users', icon: HiOutlineUsers, label: 'Users' },
    { to: '/admin/agencies', icon: HiOutlineOfficeBuilding, label: 'Agencies' },
    { to: '/admin/disputes', icon: HiOutlineExclamationCircle, label: 'Disputes' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="8" fill="#14b8a6"/>
          <path d="M8 20V8h4.5c2.5 0 4 1.5 4 3.5S15 15 12.5 15H11v5H8zm3-7.5h1.3c.9 0 1.2-.5 1.2-1.2 0-.7-.3-1.3-1.2-1.3H11v2.5z" fill="white"/>
        </svg>
        FreelanceHub
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">Main</div>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}

        <div className="sidebar-section">Discover</div>
        {discoverItems.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className="sidebar-section">Admin</div>
            {adminItems.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="sidebar-user">
        <div className="avatar avatar-sm">
          {user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">{user?.roles?.[0]}</div>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout" style={{ marginLeft: 'auto', color: 'var(--gray-400)' }}>
          <HiOutlineLogout size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
