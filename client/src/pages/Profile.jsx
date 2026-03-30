import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { usersAPI } from '../api/index.js';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    name: user?.name || '', title: user?.title || '', bio: user?.bio || '',
    hourlyRate: user?.hourlyRate || '', availability: user?.availability || 'available',
    location: { city: user?.location?.city || '', country: user?.location?.country || '' },
  });
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);

  const addSkill = () => { if (skillInput.trim() && !skills.includes(skillInput.trim())) { setSkills([...skills, skillInput.trim()]); setSkillInput(''); } };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, skills, hourlyRate: Number(form.hourlyRate) || undefined };
      const { data } = await usersAPI.updateMe(payload);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      <h2 style={{ marginBottom: 'var(--space-xl)' }}>Edit Profile</h2>
      <form className="flex flex-col gap-lg" onSubmit={handleSubmit}>
        <div className="flex items-center gap-lg mb-md">
          <div className="avatar avatar-xl">{user?.avatar ? <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user?.name?.[0]?.toUpperCase()}</div>
          <div><h3>{user?.name}</h3><p className="text-muted text-sm">{user?.email}</p><div className="flex gap-xs mt-sm">{user?.roles?.map(r => <span className="badge badge-primary" key={r}>{r}</span>)}</div></div>
        </div>

        <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Professional Title</label><input className="form-input" placeholder="e.g. Full Stack Developer" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label className="form-label">Bio</label><textarea className="form-textarea" rows={4} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="form-group"><label className="form-label">Hourly Rate (₹)</label><input type="number" className="form-input" value={form.hourlyRate} onChange={e => setForm({ ...form, hourlyRate: e.target.value })} /></div>
          <div className="form-group"><label className="form-label">Availability</label>
            <select className="form-select" value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })}>
              <option value="available">Available</option><option value="busy">Busy</option><option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="form-group"><label className="form-label">City</label><input className="form-input" value={form.location.city} onChange={e => setForm({ ...form, location: { ...form.location, city: e.target.value } })} /></div>
          <div className="form-group"><label className="form-label">Country</label><input className="form-input" value={form.location.country} onChange={e => setForm({ ...form, location: { ...form.location, country: e.target.value } })} /></div>
        </div>
        <div className="form-group">
          <label className="form-label">Skills</label>
          <div className="flex gap-sm"><input className="form-input" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add skill" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} /><button type="button" className="btn btn-secondary" onClick={addSkill}>Add</button></div>
          <div className="flex gap-xs mt-sm" style={{ flexWrap: 'wrap' }}>{skills.map(s => <span className="skill-tag" key={s} style={{ cursor: 'pointer' }} onClick={() => setSkills(skills.filter(sk => sk !== s))}>{s} ✕</span>)}</div>
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
      </form>

      {user?.notifications?.length > 0 && (
        <div style={{ marginTop: 'var(--space-2xl)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Notifications</h3>
          <div className="flex flex-col gap-sm">
            {user.notifications.slice(-10).reverse().map((n, i) => (
              <div className="card" key={i} style={{ padding: 'var(--space-md)', opacity: n.read ? 0.6 : 1 }}>
                <div className="flex items-center gap-sm"><span className={`badge badge-${n.type === 'error' ? 'error' : n.type === 'payment' ? 'success' : 'info'}`}>{n.type}</span><span className="text-sm">{n.message}</span><span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>{new Date(n.createdAt).toLocaleDateString()}</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
