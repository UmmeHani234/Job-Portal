'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: '', title: '', location: '', work_mode: 'REMOTE', employment_type: 'FULL_TIME',
    salary_min: '', salary_max: '', experience_min: '', experience_max: '',
    skills: '', description: '', benefits: '', deadline: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        experience_min: form.experience_min ? Number(form.experience_min) : undefined,
        experience_max: form.experience_max ? Number(form.experience_max) : undefined,
        skills: form.skills ? form.skills.split(',').map((s) => s.trim()) : [],
      };
      const res = await api.post('/jobs', payload);
      router.push(`/jobs/${res.data.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white border rounded-xl p-8">
      <h1 className="text-2xl font-bold mb-6">Post a Job</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input required placeholder="Company Name" className="w-full border rounded-lg px-3 py-2"
          value={form.company_name} onChange={(e) => update('company_name', e.target.value)} />
        <input required placeholder="Job Title" className="w-full border rounded-lg px-3 py-2"
          value={form.title} onChange={(e) => update('title', e.target.value)} />
        <input placeholder="Location" className="w-full border rounded-lg px-3 py-2"
          value={form.location} onChange={(e) => update('location', e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <select className="border rounded-lg px-3 py-2" value={form.work_mode} onChange={(e) => update('work_mode', e.target.value)}>
            <option value="REMOTE">Remote</option>
            <option value="ONSITE">Onsite</option>
            <option value="HYBRID">Hybrid</option>
          </select>
          <select className="border rounded-lg px-3 py-2" value={form.employment_type} onChange={(e) => update('employment_type', e.target.value)}>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Salary Min" className="border rounded-lg px-3 py-2"
            value={form.salary_min} onChange={(e) => update('salary_min', e.target.value)} />
          <input type="number" placeholder="Salary Max" className="border rounded-lg px-3 py-2"
            value={form.salary_max} onChange={(e) => update('salary_max', e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="Min Experience (yrs)" className="border rounded-lg px-3 py-2"
            value={form.experience_min} onChange={(e) => update('experience_min', e.target.value)} />
          <input type="number" placeholder="Max Experience (yrs)" className="border rounded-lg px-3 py-2"
            value={form.experience_max} onChange={(e) => update('experience_max', e.target.value)} />
        </div>

        <input placeholder="Skills (comma separated)" className="w-full border rounded-lg px-3 py-2"
          value={form.skills} onChange={(e) => update('skills', e.target.value)} />

        <textarea required placeholder="Job Description" rows={5} className="w-full border rounded-lg px-3 py-2"
          value={form.description} onChange={(e) => update('description', e.target.value)} />
        <textarea placeholder="Benefits" rows={3} className="w-full border rounded-lg px-3 py-2"
          value={form.benefits} onChange={(e) => update('benefits', e.target.value)} />

        <div>
          <label className="block text-sm font-medium mb-1">Application Deadline</label>
          <input type="date" className="w-full border rounded-lg px-3 py-2"
            value={form.deadline} onChange={(e) => update('deadline', e.target.value)} />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-brand-600 text-white py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50">
          {loading ? 'Posting...' : 'Post Job'}
        </button>
      </form>
    </div>
  );
}
