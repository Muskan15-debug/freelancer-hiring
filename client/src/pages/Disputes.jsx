import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { disputesAPI } from '../api/index.js';

const Disputes = () => {
  const toast = useToast();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => { try { const { data } = await disputesAPI.getAll(); setDisputes(data.disputes); } catch {} finally { setLoading(false); } };
    load();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>Disputes</h2>
      {disputes.length > 0 ? (
        <div className="flex flex-col gap-md">
          {disputes.map(d => (
            <div className="card" key={d._id}>
              <div className="flex justify-between items-center">
                <div>
                  <h4>{d.reason}</h4>
                  <p className="text-muted text-sm">Raised by {d.raisedBy?.name} against {d.respondent?.name}</p>
                </div>
                <span className={`badge status-${d.status}`}>{d.status.replace('_', ' ')}</span>
              </div>
              <p className="text-sm mt-md" style={{ color: 'var(--text-secondary)' }}>{d.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state"><div className="empty-state-icon">⚖️</div><div className="empty-state-title">No disputes</div><p className="text-muted text-sm">All clear! No disputes have been raised.</p></div>
      )}
    </div>
  );
};

export default Disputes;
