import { useState, useEffect } from 'react';
import { usersAPI, shortlistAPI } from '../api/index.js';
import { HiOutlineStar, HiOutlineLocationMarker, HiOutlineHeart, HiHeart, HiUsers } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext.jsx';

const TalentSearch = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [shortlists, setShortlists] = useState(new Set());
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ 
    role: 'freelancer', 
    skills: '', 
    search: '', 
    experienceLevel: '',
    minRate: '',
    maxRate: '',
    page: 1 
  });

  useEffect(() => {
    const loadShortlists = async () => {
      if (currentUser?.role !== 'recruiter' && currentUser?.role !== 'admin') return;
      try {
        const { data } = await shortlistAPI.getAll();
        const set = new Set(data.shortlists.map(s => s.targetId._id || s.targetId));
        setShortlists(set);
      } catch (err) {
        console.error(err);
      }
    };
    loadShortlists();
  }, [currentUser]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { ...filters, limit: 12 };
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        const { data } = await usersAPI.search(params);
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        console.error(err);
      }
      finally { setLoading(false); }
    };
    load();
  }, [filters]);

  const toggleShortlist = async (targetId, role) => {
    const isAgency = role === 'agency';
    try {
      const { data } = await shortlistAPI.toggle({ targetId, targetType: isAgency ? 'Agency' : 'User' });
      setShortlists(prev => {
        const newer = new Set(prev);
        if (data.shortlisted) newer.add(targetId);
        else newer.delete(targetId);
        return newer;
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', padding: 'var(--space-xl)' }}>
      <div className="section-header" style={{ textAlign: 'left' }}>
        <h2>Find Talent</h2>
        <p>Discover skilled freelancers and agencies for your projects</p>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <input className="form-input" placeholder="Search by name, title, or skills..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} style={{ flex: '1 1 300px' }} />
        <select className="form-select" value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value, page: 1 })}>
          <option value="freelancer">Freelancers</option>
          <option value="agency">Agencies</option>
          <option value="">All</option>
        </select>
        <select className="form-select" value={filters.experienceLevel} onChange={e => setFilters({ ...filters, experienceLevel: e.target.value, page: 1 })}>
          <option value="">Any Experience</option>
          <option value="junior">Junior</option>
          <option value="mid">Mid-Level</option>
          <option value="senior">Senior</option>
        </select>
        <input className="form-input" type="number" placeholder="Min $/hr" value={filters.minRate} onChange={e => setFilters({ ...filters, minRate: e.target.value, page: 1 })} style={{ width: '100px' }} />
        <input className="form-input" type="number" placeholder="Max $/hr" value={filters.maxRate} onChange={e => setFilters({ ...filters, maxRate: e.target.value, page: 1 })} style={{ width: '100px' }} />
      </div>

      {loading ? (
        <div className="grid-3">{[1,2,3,4,5,6].map(i => <div className="skeleton skeleton-card" key={i}></div>)}</div>
      ) : users.length > 0 ? (
        <div className="grid-3">
          {users.map(u => {
            const isShortlisted = shortlists.has(u._id);
            return (
              <div className="card" key={u._id} style={{ position: 'relative' }}>
                {(currentUser?.role === 'recruiter' || currentUser?.role === 'admin') && (
                  <button 
                    onClick={() => toggleShortlist(u._id, u.role)}
                    style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: isShortlisted ? 'var(--primary)' : 'var(--text-muted)' }}
                    title={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                  >
                    {isShortlisted ? <HiHeart size={24} /> : <HiOutlineHeart size={24} />}
                  </button>
                )}
                
                <div className="flex items-center gap-md mb-md">
                  <div className="avatar avatar-lg">{u.avatar ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : u.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <h4 style={{ fontSize: '1rem', paddingRight: '2rem' }}>{u.name}</h4>
                    <p className="text-muted text-sm">{u.title || (u.role === 'agency' ? 'Agency' : 'Freelancer')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-md mb-md text-sm" style={{ flexWrap: 'wrap' }}>
                  <span className="flex items-center gap-xs"><HiOutlineStar size={14} style={{ color: '#f59e0b' }} /> {u.rating?.average?.toFixed(1) || '0.0'} ({u.rating?.count || 0})</span>
                  {u.location?.city && <span className="flex items-center gap-xs text-muted"><HiOutlineLocationMarker size={14} /> {u.location.city}</span>}
                  {u.hourlyRate > 0 && <span className="font-semibold">₹{u.hourlyRate}/hr</span>}
                  {u.experienceLevel && <span className="badge" style={{ backgroundColor: 'var(--surface-plus-1)' }}>{u.experienceLevel}</span>}
                  {u.role === 'agency' && <span className="flex items-center gap-xs text-muted"><HiUsers size={14} /> {u.teamSize} members</span>}
                </div>
                
                <p className="text-sm text-muted mb-md" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {u.bio || 'No description available.'}
                </p>

                <div className="flex gap-xs" style={{ flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                  {u.skills?.slice(0, 4).map(s => <span className="skill-tag" key={s}>{s}</span>)}
                  {u.skills?.length > 4 && <span className="skill-tag">+{u.skills.length - 4}</span>}
                </div>
                
                {u.availability && <span className={`badge status-${u.availability}`}>{u.availability}</span>}
              </div>
            );
          })}
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
