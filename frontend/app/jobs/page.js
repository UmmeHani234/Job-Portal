'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import JobCard from '../../components/JobCard';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', location: '', work_mode: '', employment_type: '', sort: 'newest', page: 1,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    try {
      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Browse Jobs</h1>

      <div className="bg-white border rounded-xl p-4 mb-6 grid md:grid-cols-5 gap-3">
        <input
          placeholder="Search title or description"
          className="border rounded-lg px-3 py-2 md:col-span-2"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
        />
        <input
          placeholder="Location"
          className="border rounded-lg px-3 py-2"
          value={filters.location}
          onChange={(e) => updateFilter('location', e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={filters.work_mode}
          onChange={(e) => updateFilter('work_mode', e.target.value)}
        >
          <option value="">Any Work Mode</option>
          <option value="REMOTE">Remote</option>
          <option value="ONSITE">Onsite</option>
          <option value="HYBRID">Hybrid</option>
        </select>
        <select
          className="border rounded-lg px-3 py-2"
          value={filters.sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="salary_high">Salary: High to Low</option>
          <option value="salary_low">Salary: Low to High</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500">No jobs match your filters.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setFilters((f) => ({ ...f, page: p }))}
              className={`w-9 h-9 rounded-lg border ${
                pagination.page === p ? 'bg-brand-600 text-white border-brand-600' : 'bg-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}