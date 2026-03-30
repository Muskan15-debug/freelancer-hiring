import { useState, useEffect } from 'react';
import { paymentsAPI } from '../api/index.js';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => { try { const { data } = await paymentsAPI.getHistory(); setPayments(data.payments); } catch {} finally { setLoading(false); } };
    load();
  }, []);

  const typeLabels = { escrow_fund: 'Escrow Funded', milestone_release: 'Milestone Released', refund: 'Refund' };
  const typeColors = { escrow_fund: 'info', milestone_release: 'success', refund: 'warning' };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>Payment History</h2>
      {payments.length > 0 ? (
        <div className="card" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Type</th>
                <th style={{ padding: '0.75rem' }}>Amount</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem' }}>From</th>
                <th style={{ padding: '0.75rem' }}>To</th>
                <th style={{ padding: '0.75rem' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem' }}><span className={`badge badge-${typeColors[p.type]}`}>{typeLabels[p.type]}</span></td>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>₹{p.amount?.toLocaleString()}</td>
                  <td style={{ padding: '0.75rem' }}><span className={`badge status-${p.status}`}>{p.status}</span></td>
                  <td style={{ padding: '0.75rem' }}>{p.payer?.name}</td>
                  <td style={{ padding: '0.75rem' }}>{p.payee?.name || '—'}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state"><div className="empty-state-icon">💰</div><div className="empty-state-title">No payment history</div></div>
      )}
    </div>
  );
};

export default Payments;
