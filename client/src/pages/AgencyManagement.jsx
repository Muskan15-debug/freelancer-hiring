import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { agenciesAPI } from '../api/index.js';

const AgencyManagement = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', website: '' });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await agenciesAPI.create(form);
      toast.success('Agency created! Pending admin approval.');
      setCreating(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>Agency</h2>

      {user?.agencyId ? (
        <div className="card">
          <h3>Your Agency</h3>
          <p className="text-muted mt-sm">Agency ID: {user.agencyId}</p>
          <button className="btn btn-secondary mt-md">View Agency Details</button>
        </div>
      ) : (
        <>
          {!creating ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏢</div>
              <div className="empty-state-title">No agency yet</div>
              <p className="text-muted text-sm mb-md">Create an agency to collaborate with your team on projects</p>
              <button className="btn btn-primary" onClick={() => setCreating(true)}>Create Agency</button>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ marginBottom: 'var(--space-lg)' }}>Create Agency</h3>
              <form className="flex flex-col gap-md" onSubmit={handleCreate}>
                <div className="form-group"><label className="form-label">Agency Name</label><input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Website</label><input className="form-input" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} /></div>
                <div className="flex gap-sm"><button type="submit" className="btn btn-primary">Create</button><button type="button" className="btn btn-ghost" onClick={() => setCreating(false)}>Cancel</button></div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgencyManagement;
