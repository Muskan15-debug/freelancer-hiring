import { useState, useEffect } from 'react';
import { adminAPI } from '../api/index.js';
import { useToast } from '../context/ToastContext.jsx';

const AdminUsers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try { const { data } = await adminAPI.getUsers({ search, limit: 50 }); setUsers(data.users); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const handleAction = async (id, action) => {
    try { await adminAPI.updateUser(id, { action }); toast.success(`User ${action}ed`); load(); } catch (err) { toast.error('Failed'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg"></div></div>;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-lg">
        <h2>User Management</h2>
        <input className="form-input" style={{ maxWidth: 300 }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card" style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead><tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}><th style={{ padding: '0.75rem' }}>User</th><th style={{ padding: '0.75rem' }}>Email</th><th style={{ padding: '0.75rem' }}>Roles</th><th style={{ padding: '0.75rem' }}>Status</th><th style={{ padding: '0.75rem' }}>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.75rem' }}><div className="flex items-center gap-sm"><div className="avatar avatar-sm">{u.name?.[0]}</div>{u.name}</div></td>
                <td style={{ padding: '0.75rem' }} className="text-muted">{u.email}</td>
                <td style={{ padding: '0.75rem' }}><div className="flex gap-xs">{u.roles?.map(r => <span className="badge badge-gray" key={r}>{r}</span>)}</div></td>
                <td style={{ padding: '0.75rem' }}>{u.isBanned ? <span className="badge badge-error">Banned</span> : u.isVerified ? <span className="badge badge-success">Verified</span> : <span className="badge badge-warning">Unverified</span>}</td>
                <td style={{ padding: '0.75rem' }}><div className="flex gap-xs">
                  {!u.isVerified && <button className="btn btn-sm btn-primary" onClick={() => handleAction(u._id, 'verify')}>Verify</button>}
                  {u.isBanned ? <button className="btn btn-sm btn-secondary" onClick={() => handleAction(u._id, 'unban')}>Unban</button> : <button className="btn btn-sm btn-danger" onClick={() => handleAction(u._id, 'ban')}>Ban</button>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
