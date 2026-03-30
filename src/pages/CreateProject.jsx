import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../api/index.js';
import { useToast } from '../context/ToastContext.jsx';

const CATEGORIES = ['Web Development','Mobile Development','UI/UX Design','Graphic Design','Data Science','Machine Learning','DevOps','Cloud Computing','Cybersecurity','Content Writing','Digital Marketing','Video Production','Game Development','Blockchain','Other'];

const CreateProject = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({ title: '', description: '', budget: { min: '', max: '', currency: 'INR' }, skills: [], deadline: '', category: '' });

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (s) => setForm({ ...form, skills: form.skills.filter(sk => sk !== s) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.skills.length === 0) return toast.error('Add at least one skill');
    setLoading(true);
    try {
      const payload = { ...form, budget: { min: Number(form.budget.min), max: Number(form.budget.max), currency: 'INR' } };
      const { data } = await projectsAPI.create(payload);
      toast.success('Project created!');
      navigate(`/projects/${data.project._id}`);
    } catch (err) { toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create project'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 680 }}>
      <h2 style={{ marginBottom: 'var(--space-xl)' }}>Create New Project</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
        <div className="form-group"><label className="form-label">Project Title</label><input className="form-input" required minLength={5} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. E-commerce Website Redesign" /></div>
        <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" required minLength={20} rows={6} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your project in detail..." /></div>
        <div className="form-group"><label className="form-label">Category</label>
          <select className="form-select" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option value="">Select Category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <div className="form-group"><label className="form-label">Min Budget (₹)</label><input type="number" className="form-input" required min={0} value={form.budget.min} onChange={e => setForm({ ...form, budget: { ...form.budget, min: e.target.value } })} /></div>
          <div className="form-group"><label className="form-label">Max Budget (₹)</label><input type="number" className="form-input" required min={0} value={form.budget.max} onChange={e => setForm({ ...form, budget: { ...form.budget, max: e.target.value } })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Deadline</label><input type="date" className="form-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} /></div>
        <div className="form-group">
          <label className="form-label">Skills Required</label>
          <div className="flex gap-sm">
            <input className="form-input" value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
            <button type="button" className="btn btn-secondary" onClick={addSkill}>Add</button>
          </div>
          <div className="flex gap-xs" style={{ flexWrap: 'wrap', marginTop: 'var(--space-sm)' }}>
            {form.skills.map(s => (<span className="skill-tag" key={s} style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)}>{s} ✕</span>))}
          </div>
        </div>
        <div className="flex gap-md">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>{loading ? 'Creating...' : 'Create Project'}</button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/projects')}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
