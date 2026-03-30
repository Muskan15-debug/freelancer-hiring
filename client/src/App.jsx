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
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminAgencies from './pages/AdminAgencies.jsx';
import AdminDisputes from './pages/AdminDisputes.jsx';
import NotFound from './pages/NotFound.jsx';

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

              {/* Protected dashboard routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/new" element={<CreateProject />} />
                  <Route path="/projects/:id" element={<ProjectDetail />} />
                  <Route path="/contracts" element={<Contracts />} />
                  <Route path="/contracts/:id" element={<ContractDetail />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/disputes" element={<Disputes />} />
                  <Route path="/payments" element={<Payments />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/agency" element={<AgencyManagement />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/agencies" element={<AdminAgencies />} />
                  <Route path="/admin/disputes" element={<AdminDisputes />} />
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
