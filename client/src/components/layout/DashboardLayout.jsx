import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

const pageTitles = {
  // Admin
  '/admin': 'Overview Panel',
  '/admin/users': 'User Management',
  '/admin/agencies': 'Agency Approval Queue',
  '/admin/disputes': 'Dispute Management',
  '/admin/analytics': 'Platform Analytics',

  // Recruiter
  '/recruiter': 'Talent Discovery',
  '/recruiter/shortlist': 'Shortlist',
  '/recruiter/invites': 'Invites & Messages',
  '/recruiter/pipeline': 'Hiring Pipeline View',

  // Project Manager
  '/pm': 'Dashboard / Project Switcher',
  '/pm/projects': 'Project Switcher',
  '/pm/milestones': 'Milestone Management',
  '/pm/team': 'Team View / Task Board',

  // Freelancer
  '/freelancer': 'My Tasks',
  '/freelancer/projects': 'Active Projects',
  '/freelancer/invites': 'Invites Inbox',
  '/freelancer/earnings': 'Earnings',
  '/freelancer/profile': 'Profile Management',

  // Agency
  '/agency': 'Agency Profile',
  '/agency/team': 'Team Management',
  '/agency/projects': 'Project View',
  '/agency/earnings': 'Earnings & Payouts'
};

const DashboardLayout = () => {
  const { pathname } = useLocation();
  // Strip trailing slashes or handle dynamic segments if needed
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
