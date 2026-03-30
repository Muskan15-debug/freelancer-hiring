import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { contractsAPI, milestonesAPI, tasksAPI } from '../api/index.js';

const ContractDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [contract, setContract] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tab, setTab] = useState('milestones');
  const [loading, setLoading] = useState(true);
  const [mForm, setMForm] = useState({ title: '', description: '', amount: '', dueDate: '' });
  const [tForm, setTForm] = useState({ title: '', description: '', priority: 'medium' });
  const [showMForm, setShowMForm] = useState(false);
  const [showTForm, setShowTForm] = useState(false);

  const load = async () => {
    try {
      const [cRes, mRes, tRes] = await Promise.all([contractsAPI.getOne(id), milestonesAPI.getAll(id), tasksAPI.getAll(id)]);
      setContract(cRes.data.contract);
      setMilestones(mRes.data.milestones);
      setTasks(tRes.data.tasks);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const createMilestone = async (e) => {
    e.preventDefault();
    try {
      await milestonesAPI.create(id, { ...mForm, amount: Number(mForm.amount) });
      toast.success('Milestone created');
      setShowMForm(false);
      setMForm({ title: '', description: '', amount: '', dueDate: '' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const updateMilestoneStatus = async (mId, status) => {
    try {
      await milestonesAPI.updateStatus(id, mId, { status });
      toast.success(`Milestone ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await tasksAPI.create(id, tForm);
      toast.success('Task created');
      setShowTForm(false);
      setTForm({ title: '', description: '', priority: 'medium' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await tasksAPI.updateStatus(id, taskId, status);
      toast.success(`Task ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;
  if (!contract) return null;

  const isPM = contract.projectManager?._id === user?._id;
  const isWorker = contract.worker?._id === user?._id;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-lg">
        <div>
          <h2>{contract.project?.title}</h2>
          <p className="text-muted text-sm">Worker: {contract.worker?.name} • PM: {contract.projectManager?.name || 'Unassigned'} • ₹{contract.totalAmount?.toLocaleString()}</p>
        </div>
        <span className={`badge status-${contract.status}`}>{contract.status}</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'milestones' ? 'active' : ''}`} onClick={() => setTab('milestones')}>Milestones ({milestones.length})</button>
        <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>Tasks ({tasks.length})</button>
        <button className={`tab ${tab === 'activity' ? 'active' : ''}`} onClick={() => setTab('activity')}>Activity</button>
      </div>

      {tab === 'milestones' && (
        <div>
          {(isPM || user?.roles?.includes('recruiter')) && contract.status === 'active' && (
            <button className="btn btn-primary btn-sm mb-lg" onClick={() => setShowMForm(!showMForm)}>+ New Milestone</button>
          )}
          {showMForm && (
            <form className="card mb-lg" onSubmit={createMilestone} style={{ maxWidth: 500 }}>
              <div className="form-group mb-md"><input className="form-input" placeholder="Title" required value={mForm.title} onChange={e => setMForm({ ...mForm, title: e.target.value })} /></div>
              <div className="form-group mb-md"><textarea className="form-textarea" placeholder="Description" value={mForm.description} onChange={e => setMForm({ ...mForm, description: e.target.value })} /></div>
              <div className="flex gap-md mb-md">
                <div className="form-group" style={{ flex: 1 }}><input type="number" className="form-input" placeholder="Amount (₹)" required value={mForm.amount} onChange={e => setMForm({ ...mForm, amount: e.target.value })} /></div>
                <div className="form-group" style={{ flex: 1 }}><input type="date" className="form-input" value={mForm.dueDate} onChange={e => setMForm({ ...mForm, dueDate: e.target.value })} /></div>
              </div>
              <div className="flex gap-sm"><button type="submit" className="btn btn-primary btn-sm">Create</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowMForm(false)}>Cancel</button></div>
            </form>
          )}
          <div className="flex flex-col gap-md">
            {milestones.map((m, i) => (
              <div className="card" key={m._id}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-sm"><span className="text-muted text-sm">#{i + 1}</span><h4>{m.title}</h4></div>
                    <p className="text-muted text-sm">{m.description}</p>
                  </div>
                  <div className="flex items-center gap-md">
                    <div className="font-bold">₹{m.amount?.toLocaleString()}</div>
                    <span className={`badge status-${m.status}`}>{m.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex gap-sm mt-md">
                  {isWorker && m.status === 'pending' && <button className="btn btn-sm btn-primary" onClick={() => updateMilestoneStatus(m._id, 'in_progress')}>Start</button>}
                  {isWorker && m.status === 'in_progress' && <button className="btn btn-sm btn-primary" onClick={() => updateMilestoneStatus(m._id, 'submitted')}>Submit</button>}
                  {isPM && m.status === 'submitted' && (<><button className="btn btn-sm btn-primary" onClick={() => updateMilestoneStatus(m._id, 'approved')}>Approve</button><button className="btn btn-sm btn-secondary" onClick={() => updateMilestoneStatus(m._id, 'revision_requested')}>Request Revision</button></>)}
                  {isWorker && m.status === 'revision_requested' && <button className="btn btn-sm btn-primary" onClick={() => updateMilestoneStatus(m._id, 'in_progress')}>Resume</button>}
                </div>
              </div>
            ))}
            {milestones.length === 0 && <div className="empty-state"><div className="empty-state-icon">📌</div><div className="empty-state-title">No milestones yet</div></div>}
          </div>
        </div>
      )}

      {tab === 'tasks' && (
        <div>
          {contract.status === 'active' && <button className="btn btn-primary btn-sm mb-lg" onClick={() => setShowTForm(!showTForm)}>+ New Task</button>}
          {showTForm && (
            <form className="card mb-lg" onSubmit={createTask} style={{ maxWidth: 500 }}>
              <div className="form-group mb-md"><input className="form-input" placeholder="Task title" required value={tForm.title} onChange={e => setTForm({ ...tForm, title: e.target.value })} /></div>
              <div className="form-group mb-md"><textarea className="form-textarea" placeholder="Description" value={tForm.description} onChange={e => setTForm({ ...tForm, description: e.target.value })} /></div>
              <div className="form-group mb-md"><select className="form-select" value={tForm.priority} onChange={e => setTForm({ ...tForm, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
              <div className="flex gap-sm"><button type="submit" className="btn btn-primary btn-sm">Create</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowTForm(false)}>Cancel</button></div>
            </form>
          )}
          <div className="kanban-board">
            {['todo', 'in_progress', 'completed'].map(status => (
              <div className="kanban-column" key={status}>
                <div className="kanban-column-header"><span>{status === 'todo' ? 'To Do' : status === 'in_progress' ? 'In Progress' : 'Completed'}</span><span className="kanban-column-count">{tasks.filter(t => t.status === status).length}</span></div>
                {tasks.filter(t => t.status === status).map(t => (
                  <div className={`task-card priority-${t.priority}`} key={t._id}>
                    <div className="task-card-title">{t.title}</div>
                    <div className="task-card-meta">
                      <span className={`badge badge-${t.priority === 'high' ? 'error' : t.priority === 'medium' ? 'warning' : 'success'}`}>{t.priority}</span>
                      <div className="flex gap-xs">
                        {t.status === 'todo' && <button className="btn btn-sm btn-ghost" onClick={() => updateTaskStatus(t._id, 'in_progress')}>▶</button>}
                        {t.status === 'in_progress' && <button className="btn btn-sm btn-ghost" onClick={() => updateTaskStatus(t._id, 'completed')}>✓</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="flex flex-col gap-sm">
          {contract.activity?.map((a, i) => (
            <div className="card" key={i} style={{ padding: 'var(--space-md)' }}>
              <div className="flex items-center gap-sm">
                <div className="avatar avatar-sm">{a.by?.name?.[0] || '?'}</div>
                <div><span className="font-semibold text-sm">{a.by?.name || 'System'}</span><span className="text-muted text-sm"> — {a.action}</span></div>
                <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>{new Date(a.createdAt).toLocaleDateString()}</span>
              </div>
              {a.note && <p className="text-sm text-muted mt-sm" style={{ marginLeft: 44 }}>{a.note}</p>}
            </div>
          ))}
          {!contract.activity?.length && <div className="empty-state"><div className="empty-state-title">No activity yet</div></div>}
        </div>
      )}
    </div>
  );
};

export default ContractDetail;
