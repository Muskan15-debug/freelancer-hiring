import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { projectsAPI } from '../api/index.js';

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', skills: '', search: '', sort: 'newest', page: 1 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { ...filters, limit: 12 };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        const { data } = await projectsAPI.getAll(params);
        setProjects(data.projects);
        setPagination(data.pagination);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [filters]);

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h2>Projects</h2>
          <p className="text-muted text-sm">{pagination.total || 0} projects found</p>
        </div>
        {user?.roles?.includes('recruiter') && (
          <button className="btn btn-primary" onClick={() => navigate('/projects/new')}>+ New Project</button>
        )}
      </div>

      <div className="filter-bar">
        <input className="form-input" placeholder="Search projects..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} />
        <select className="form-select" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="draft">Draft</option>
        </select>
        <select className="form-select" value={filters.sort} onChange={e => setFilters({ ...filters, sort: e.target.value })}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="budget_high">Budget: High → Low</option>
          <option value="budget_low">Budget: Low → High</option>
        </select>
      </div>

      {loading ? (
        <div className="grid-3">{[1,2,3,4,5,6].map(i => <div className="skeleton skeleton-card" key={i}></div>)}</div>
      ) : projects.length > 0 ? (
        <>
          <div className="grid-3">
            {projects.map(p => (
              <div className="project-card" key={p._id} onClick={() => navigate(`/projects/${p._id}`)}>
                <div className="project-card-header">
                  <div className="project-card-title">{p.title}</div>
                  <span className={`badge status-${p.status}`}>{p.status.replace('_', ' ')}</span>
                </div>
                <div className="project-card-desc">{p.description}</div>
                <div className="project-card-skills">
                  {p.skills?.slice(0, 4).map(s => <span className="skill-tag" key={s}>{s}</span>)}
                  {p.skills?.length > 4 && <span className="skill-tag">+{p.skills.length - 4}</span>}
                </div>
                <div className="project-card-footer">
                  <span className="project-budget">₹{p.budget?.min?.toLocaleString()} - ₹{p.budget?.max?.toLocaleString()}</span>
                  <span>{p.applicationsCount || 0} applicants</span>
                </div>
              </div>
            ))}
          </div>
          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i} className={`pagination-btn ${filters.page === i + 1 ? 'active' : ''}`} onClick={() => setFilters({ ...filters, page: i + 1 })}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No projects found</div>
          <p className="text-muted text-sm">Try adjusting your filters or create a new project</p>
        </div>
      )}
    </div>
  );
};

export default Projects;
