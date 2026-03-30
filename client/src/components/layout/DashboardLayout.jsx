import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/projects/new': 'Create Project',
  '/contracts': 'Contracts',
  '/messages': 'Messages',
  '/disputes': 'Disputes',
  '/payments': 'Payments',
  '/profile': 'Profile',
  '/talent': 'Find Talent',
  '/agency': 'Agency',
  '/admin': 'Admin Analytics',
  '/admin/users': 'User Management',
  '/admin/agencies': 'Agency Management',
  '/admin/disputes': 'Dispute Management',
};

const DashboardLayout = () => {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'FreelanceHub';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar title={title} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
