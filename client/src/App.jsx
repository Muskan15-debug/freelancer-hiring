import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';

import PublicLayout from './components/layout/PublicLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Projects from './pages/Projects.jsx';
import CreateProject from './pages/CreateProject.jsx';
import ProjectDetail from './pages/ProjectDetail.jsx';
import Contracts from './pages/Contracts.jsx';
import ContractDetail from './pages/ContractDetail.jsx';
import Messages from './pages/Messages.jsx';
import Disputes from './pages/Disputes.jsx';
import Payments from './pages/Payments.jsx';
import Profile from './pages/Profile.jsx';
import TalentSearch from './pages/TalentSearch.jsx';
import AgencyManagement from './pages/AgencyManagement.jsx';
import RecruiterDashboard from './pages/RecruiterDashboard.jsx';
import FreelancerInvites from './pages/FreelancerInvites.jsx';
import AgencyInvites from './pages/AgencyInvites.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminAgencies from './pages/AdminAgencies.jsx';
import AdminDisputes from './pages/AdminDisputes.jsx';
import NotFound from './pages/NotFound.jsx';

const Placeholder = ({ title }) => (
  <div className="card fade-in">
    <h3>{title}</h3>
    <p className="text-muted">This view is currently under construction.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SocketProvider>
            <Routes>
              {/* Public routes */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/talent" element={<TalentSearch />} />
              </Route>

              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* Admin Protected routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/agencies" element={<AdminAgencies />} />
                  <Route path="/admin/disputes" element={<AdminDisputes />} />
                  <Route path="/admin/analytics" element={<Placeholder title="Platform Analytics" />} />
                </Route>
              </Route>

              {/* Recruiter Protected routes */}
              <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/recruiter" element={<TalentSearch />} />
                  <Route path="/recruiter/shortlist" element={<RecruiterDashboard initialTab={0} />} />
                  <Route path="/recruiter/invites" element={<RecruiterDashboard initialTab={1} />} />
                  <Route path="/recruiter/pipeline" element={<RecruiterDashboard />} />
                </Route>
              </Route>

              {/* PM Protected routes */}
              <Route element={<ProtectedRoute allowedRoles={['projectManager']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/pm" element={<Placeholder title="Dashboard / Project Switcher" />} />
                  <Route path="/pm/projects" element={<Placeholder title="Project Switcher" />} />
                  <Route path="/pm/milestones" element={<Placeholder title="Milestone Management" />} />
                  <Route path="/pm/team" element={<Placeholder title="Team View" />} />
                </Route>
              </Route>

              {/* Freelancer Protected routes */}
              <Route element={<ProtectedRoute allowedRoles={['freelancer']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/freelancer" element={<Dashboard />} />
                  <Route path="/freelancer/projects" element={<Projects />} />
                  <Route path="/freelancer/invites" element={<FreelancerInvites />} />
                  <Route path="/freelancer/earnings" element={<Payments />} />
                  <Route path="/freelancer/profile" element={<Profile />} />
                </Route>
              </Route>

              {/* Agency Protected routes */}
              <Route element={<ProtectedRoute allowedRoles={['agency']} />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/agency" element={<AgencyManagement />} />
                  <Route path="/agency/team" element={<Placeholder title="Team Management" />} />
                  <Route path="/agency/projects" element={<Placeholder title="Project View" />} />
                  <Route path="/agency/invites" element={<AgencyInvites />} />
                  <Route path="/agency/earnings" element={<Placeholder title="Earnings & Payouts" />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </SocketProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
