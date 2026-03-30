import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { projectsAPI, applicationsAPI } from '../api/index.js';

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [applications, setApplications] = useState([]);
  const [tab, setTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [appForm, setAppForm] = useState({ coverLetter: '', proposedBudget: '', proposedTimeline: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await projectsAPI.getOne(id);
        setProject(data.project);
        if (user) {
          try { const appRes = await applicationsAPI.getAll(id); setApplications(appRes.data.applications); } catch {}
        }
      } catch { navigate('/projects'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      await applicationsAPI.apply(id, { ...appForm, proposedBudget: Number(appForm.proposedBudget) });
      toast.success('Application submitted!');
      const appRes = await applicationsAPI.getAll(id);
      setApplications(appRes.data.applications);
      setTab('applications');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
    finally { setApplying(false); }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await applicationsAPI.updateStatus(id, appId, status);
      toast.success(`Application ${status}`);
      const appRes = await applicationsAPI.getAll(id);
      setApplications(appRes.data.applications);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handlePublish = async () => {
    try {
      await projectsAPI.updateStatus(id, 'open');
      setProject({ ...project, status: 'open' });
      toast.success('Project published!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;
  if (!project) return null;

  const isOwner = project.owner?._id === user?._id;
  const isFreelancer = user?.roles?.includes('freelancer');
  const hasApplied = applications.some(a => a.applicant?._id === user?._id);

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-lg">
        <div>
          <div className="flex items-center gap-md mb-sm">
            <h2>{project.title}</h2>
            <span className={`badge status-${project.status}`}>{project.status.replace('_', ' ')}</span>
          </div>
          <p className="text-muted text-sm">Posted by {project.owner?.name} • {project.category}</p>
        </div>
        <div className="flex gap-sm">
          {isOwner && project.status === 'draft' && <button className="btn btn-primary" onClick={handlePublish}>Publish</button>}
          {isOwner && <button className="btn btn-secondary" onClick={() => navigate(`/projects/${id}`)}>Edit</button>}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'details' ? 'active' : ''}`} onClick={() => setTab('details')}>Details</button>
        <button className={`tab ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}>Applications ({applications.length})</button>
        {isFreelancer && !hasApplied && project.status === 'open' && !isOwner && <button className={`tab ${tab === 'apply' ? 'active' : ''}`} onClick={() => setTab('apply')}>Apply</button>}
      </div>

      {tab === 'details' && (
        <div className="card">
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <h4 style={{ marginBottom: 'var(--space-sm)' }}>Description</h4>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{project.description}</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
            <div><div className="text-muted text-sm">Budget</div><div className="font-bold">₹{project.budget?.min?.toLocaleString()} - ₹{project.budget?.max?.toLocaleString()}</div></div>
            <div><div className="text-muted text-sm">Deadline</div><div className="font-bold">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}</div></div>
            <div><div className="text-muted text-sm">Applications</div><div className="font-bold">{project.applicationsCount || 0}</div></div>
          </div>
          <div><div className="text-muted text-sm mb-sm">Skills Required</div>
            <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
              {project.skills?.map(s => <span className="skill-tag" key={s}>{s}</span>)}
            </div>
          </div>
        </div>
      )}

      {tab === 'applications' && (
        <div className="flex flex-col gap-md">
          {applications.length > 0 ? applications.map(app => (
            <div className="card" key={app._id}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-md">
                  <div className="avatar">{app.applicant?.name?.[0]}</div>
                  <div>
                    <div className="font-semibold">{app.applicant?.name}</div>
                    <div className="text-muted text-sm">{app.applicant?.title || 'Freelancer'} • ₹{app.proposedBudget?.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={`badge status-${app.status}`}>{app.status}</span>
                  {isOwner && app.status === 'pending' && (<><button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(app._id, 'shortlisted')}>Shortlist</button><button className="btn btn-sm btn-danger" onClick={() => handleStatusChange(app._id, 'rejected')}>Reject</button></>)}
                  {isOwner && app.status === 'shortlisted' && <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(app._id, 'invited')}>Invite</button>}
                  {!isOwner && app.status === 'invited' && app.applicant?._id === user?._id && <button className="btn btn-sm btn-primary" onClick={() => handleStatusChange(app._id, 'accepted')}>Accept</button>}
                </div>
              </div>
              <p className="text-sm mt-md" style={{ color: 'var(--text-secondary)' }}>{app.coverLetter}</p>
            </div>
          )) : <div className="empty-state"><div className="empty-state-icon">📩</div><div className="empty-state-title">No applications yet</div></div>}
        </div>
      )}

      {tab === 'apply' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Submit Application</h3>
          <form className="flex flex-col gap-md" onSubmit={handleApply}>
            <div className="form-group"><label className="form-label">Cover Letter</label><textarea className="form-textarea" required minLength={10} rows={5} value={appForm.coverLetter} onChange={e => setAppForm({ ...appForm, coverLetter: e.target.value })} placeholder="Why are you a great fit?" /></div>
            <div className="form-group"><label className="form-label">Proposed Budget (₹)</label><input type="number" className="form-input" required min={0} value={appForm.proposedBudget} onChange={e => setAppForm({ ...appForm, proposedBudget: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Proposed Timeline</label><input className="form-input" value={appForm.proposedTimeline} onChange={e => setAppForm({ ...appForm, proposedTimeline: e.target.value })} placeholder="e.g. 4 weeks" /></div>
            <button type="submit" className="btn btn-primary" disabled={applying}>{applying ? 'Submitting...' : 'Submit Application'}</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
