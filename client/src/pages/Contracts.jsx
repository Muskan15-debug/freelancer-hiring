import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contractsAPI } from '../api/index.js';

const Contracts = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const { data } = await contractsAPI.getAll(params);
        setContracts(data.contracts);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [statusFilter]);

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-lg">
        <h2>Contracts</h2>
        <select className="form-select" style={{ width: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>
      {contracts.length > 0 ? (
        <div className="flex flex-col gap-md">
          {contracts.map(c => (
            <div className="card" key={c._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/contracts/${c._id}`)}>
              <div className="flex justify-between items-center">
                <div>
                  <h4>{c.project?.title || 'Untitled Project'}</h4>
                  <p className="text-muted text-sm">
                    Worker: {c.worker?.name} • PM: {c.projectManager?.name || 'Unassigned'}
                  </p>
                </div>
                <div className="flex items-center gap-md">
                  <div className="text-right">
                    <div className="font-bold">₹{c.totalAmount?.toLocaleString()}</div>
                    <div className="text-xs text-muted">{c.escrowFunded ? '✓ Escrow funded' : '○ Escrow pending'}</div>
                  </div>
                  <span className={`badge status-${c.status}`}>{c.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state"><div className="empty-state-icon">📄</div><div className="empty-state-title">No contracts yet</div><p className="text-muted text-sm">Contracts are created automatically when applications are accepted</p></div>
      )}
    </div>
  );
};

export default Contracts;
