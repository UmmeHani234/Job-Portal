'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';

export default function CandidateDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data)).catch((err) => setError(err.message));
    api.get('/applications?limit=20').then((res) => setApplications(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Candidate Dashboard</h1>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {stats && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-brand-600">{stats.totalApplications}</p>
            <p className="text-sm text-gray-500 mt-1">Applications Submitted</p>
          </div>
          <div className="bg-white border rounded-xl p-5 text-center">
            <p className="text-3xl font-bold text-brand-600">{stats.totalSaved}</p>
            <p className="text-sm text-gray-500 mt-1">Jobs Saved</p>
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Your Applications</h2>
      <div className="space-y-3">
        {applications.map((app) => (
          <div key={app.id} className="bg-white border rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{app.job?.title}</p>
              <p className="text-sm text-gray-500">{app.job?.company?.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor(app.status)}`}>{app.status}</span>
              <Link href={`/jobs/${app.job_id}`} className="text-brand-600 text-sm font-medium">View</Link>
            </div>
          </div>
        ))}
        {applications.length === 0 && <p className="text-gray-500">You haven&apos;t applied to any jobs yet.</p>}
      </div>
    </div>
  );
}

function statusColor(status) {
  switch (status) {
    case 'SHORTLISTED': return 'bg-blue-50 text-blue-700';
    case 'HIRED': return 'bg-green-50 text-green-700';
    case 'REJECTED': return 'bg-red-50 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}
