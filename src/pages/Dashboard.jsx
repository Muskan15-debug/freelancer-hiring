import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { projectsAPI, contractsAPI } from '../api/index.js';
import { HiOutlineBriefcase, HiOutlineDocumentText, HiOutlineCash, HiOutlineStar } from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ projects: 0, contracts: 0 });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, contRes] = await Promise.all([
          projectsAPI.getAll({ limit: 5, owner: 'me' }),
          contractsAPI.getAll({ limit: 5 }),
        ]);
        setStats({ projects: projRes.data.pagination.total, contracts: contRes.data.pagination.total });
        setRecentProjects(projRes.data.projects);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const cards = [
    { icon: HiOutlineBriefcase, label: 'My Projects', value: stats.projects, color: '#0d9488' },
    { icon: HiOutlineDocumentText, label: 'Active Contracts', value: stats.contracts, color: '#3b82f6' },
    { icon: HiOutlineCash, label: 'Total Earned', value: '₹0', color: '#f59e0b' },
    { icon: HiOutlineStar, label: 'Rating', value: user?.rating?.average?.toFixed(1) || '0.0', color: '#8b5cf6' },
  ];

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ marginBottom: 'var(--space-xs)' }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-muted">Here's what's happening with your freelancing activity.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-xl)' }}>
        {cards.map((c, i) => (
          <div className="stat-card" key={i}>
            <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--space-sm)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${c.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                <c.icon size={20} />
              </div>
            </div>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mb-md">
        <h3>Recent Projects</h3>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')}>View All</button>
      </div>

      {recentProjects.length > 0 ? (
        <div className="grid-3">
          {recentProjects.map(p => (
            <div className="project-card" key={p._id} onClick={() => navigate(`/projects/${p._id}`)}>
              <div className="project-card-header">
                <div className="project-card-title">{p.title}</div>
                <span className={`badge status-${p.status}`}>{p.status.replace('_', ' ')}</span>
              </div>
              <div className="project-card-desc">{p.description}</div>
              <div className="project-card-skills">
                {p.skills?.slice(0, 3).map(s => <span className="skill-tag" key={s}>{s}</span>)}
              </div>
              <div className="project-card-footer">
                <span className="project-budget">₹{p.budget?.min?.toLocaleString()} - ₹{p.budget?.max?.toLocaleString()}</span>
                <span>{p.applicationsCount || 0} applicants</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No projects yet</div>
          <p className="text-muted text-sm">Create your first project or browse available ones</p>
          <div className="flex gap-sm mt-md">
            {user?.roles?.includes('recruiter') && <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>Create Project</button>}
            <button className="btn btn-secondary" onClick={() => navigate('/projects')}>Browse Projects</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
