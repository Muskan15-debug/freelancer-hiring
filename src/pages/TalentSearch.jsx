import { useState, useEffect } from 'react';
import { usersAPI } from '../api/index.js';
import { HiOutlineStar, HiOutlineLocationMarker } from 'react-icons/hi';

const TalentSearch = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: 'freelancer', skills: '', search: '', page: 1 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { ...filters, limit: 12 };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        const { data } = await usersAPI.search(params);
        setUsers(data.users);
        setPagination(data.pagination);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, [filters]);

  return (
    <div className="fade-in" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl)' }}>
      <div className="section-header" style={{ textAlign: 'left' }}>
        <h2>Find Talent</h2>
        <p>Discover skilled freelancers and agencies for your projects</p>
      </div>

      <div className="filter-bar">
        <input className="form-input" placeholder="Search by name, title, or skills..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} />
        <select className="form-select" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value, page: 1 })}>
          <option value="freelancer">Freelancers</option>
          <option value="agency">Agencies</option>
          <option value="">All</option>
        </select>
      </div>

      {loading ? (
        <div className="grid-3">{[1,2,3,4,5,6].map(i => <div className="skeleton skeleton-card" key={i}></div>)}</div>
      ) : users.length > 0 ? (
        <div className="grid-3">
          {users.map(u => (
            <div className="card" key={u._id}>
              <div className="flex items-center gap-md mb-md">
                <div className="avatar avatar-lg">{u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.name?.[0]?.toUpperCase()}</div>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>{u.name}</h4>
                  <p className="text-muted text-sm">{u.title || 'Freelancer'}</p>
                </div>
              </div>
              <div className="flex items-center gap-md mb-md text-sm">
                <span className="flex items-center gap-xs"><HiOutlineStar size={14} style={{ color: '#f59e0b' }} /> {u.rating?.average?.toFixed(1) || '0.0'} ({u.rating?.count || 0})</span>
                {u.location?.city && <span className="flex items-center gap-xs text-muted"><HiOutlineLocationMarker size={14} /> {u.location.city}</span>}
                {u.hourlyRate > 0 && <span className="font-semibold">₹{u.hourlyRate}/hr</span>}
              </div>
              <div className="flex gap-xs" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                {u.skills?.slice(0, 4).map(s => <span className="skill-tag" key={s}>{s}</span>)}
              </div>
              <span className={`badge status-${u.availability}`}>{u.availability}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state"><div className="empty-state-icon">🔍</div><div className="empty-state-title">No talent found</div></div>
      )}

      {pagination.pages > 1 && (
        <div className="pagination">{Array.from({ length: pagination.pages }, (_, i) => (<button key={i} className={`pagination-btn ${filters.page === i + 1 ? 'active' : ''}`} onClick={() => setFilters({ ...filters, page: i + 1 })}>{i + 1}</button>))}</div>
      )}
    </div>
  );
};

export default TalentSearch;
