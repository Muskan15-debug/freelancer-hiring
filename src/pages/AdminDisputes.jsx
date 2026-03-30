import { useState, useEffect } from 'react';
import { adminAPI } from '../api/index.js';
import { useToast } from '../context/ToastContext.jsx';
import { disputesAPI } from '../api/index.js';

const AdminDisputes = () => {
  const toast = useToast();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => { try { const { data } = await adminAPI.getDisputes(); setDisputes(data.disputes); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await disputesAPI.updateStatus(id, { status, decision: status === 'resolved' ? 'Resolved by admin' : undefined });
      toast.success(`Dispute ${status}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>All Disputes</h2>
      {disputes.length > 0 ? (
        <div className="flex flex-col gap-md">
          {disputes.map(d => (
            <div className="card" key={d._id}>
              <div className="flex justify-between items-center mb-md">
                <div><h4>{d.reason}</h4><p className="text-muted text-sm">{d.raisedBy?.name} vs {d.respondent?.name}</p></div>
                <span className={`badge status-${d.status}`}>{d.status.replace('_', ' ')}</span>
              </div>
              {d.status === 'open' && <button className="btn btn-sm btn-primary" onClick={() => handleStatus(d._id, 'under_review')}>Take for Review</button>}
              {d.status === 'under_review' && (
                <div className="flex gap-sm">
                  <button className="btn btn-sm btn-primary" onClick={() => handleStatus(d._id, 'resolved')}>Resolve</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleStatus(d._id, 'escalated')}>Escalate</button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state"><div className="empty-state-icon">⚖️</div><div className="empty-state-title">No disputes</div></div>
      )}
    </div>
  );
};

export default AdminDisputes;
