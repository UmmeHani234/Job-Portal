'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { getSession } from '../../../lib/auth';

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [message, setMessage] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const { user } = getSession();

  useEffect(() => {
    api.get(`/jobs/${id}`).then((res) => setJob(res.data)).catch((err) => setMessage(err.message));
  }, [id]);

  async function handleApply() {
    if (!user) return router.push('/login');
    if (user.role !== 'CANDIDATE') return setMessage('Only candidates can apply to jobs.');
    try {
      await api.post(`/jobs/${id}/apply`, { cover_letter: coverLetter });
      setMessage('Application submitted successfully!');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleSave() {
    if (!user) return router.push('/login');
    try {
      await api.post(`/jobs/${id}/save`, {});
      setMessage('Job saved to your list.');
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!job) return <p className="text-gray-500">Loading job...</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white border rounded-xl p-8">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="text-gray-600 mt-1">{job.company?.name} · {job.location}</p>

      <div className="flex flex-wrap gap-2 mt-4">
        {job.work_mode && <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">{job.work_mode}</span>}
        {job.employment_type && <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{job.employment_type}</span>}
        {(job.skills || []).map((s) => (
          <span key={s} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{s}</span>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-6 text-sm">
        <p><strong>Salary:</strong> {job.salary_currency} {job.salary_min ?? '?'} - {job.salary_max ?? '?'}</p>
        <p><strong>Experience:</strong> {job.experience_min}{job.experience_max ? `-${job.experience_max}` : '+'} years</p>
        <p><strong>Deadline:</strong> {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Not specified'}</p>
        <p><strong>Source:</strong> {job.source}</p>
      </div>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
      </div>

      {job.benefits && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Benefits</h2>
          <p className="text-gray-700 whitespace-pre-line">{job.benefits}</p>
        </div>
      )}

      {message && <p className="mt-6 text-sm text-brand-700 bg-brand-50 border border-brand-100 rounded-lg p-3">{message}</p>}

      {(!user || user.role === 'CANDIDATE') && (
        <div className="mt-6 space-y-3">
          <textarea
            placeholder="Optional cover letter"
            className="w-full border rounded-lg px-3 py-2"
            rows={3}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
          <div className="flex gap-3">
            <button onClick={handleApply} className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700">
              Apply Now
            </button>
            <button onClick={handleSave} className="border border-brand-600 text-brand-600 px-5 py-2 rounded-lg font-medium hover:bg-brand-50">
              Save Job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
