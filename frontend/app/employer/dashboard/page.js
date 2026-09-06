'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';

export default function EmployerDashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError('');

      const [statsResponse, jobsResponse] = await Promise.all([
        api.get('/dashboard'),
        api.get('/jobs?limit=50&status=OPEN'),
      ]);

      setStats(statsResponse.data);
      setJobs(jobsResponse.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to load dashboard'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleClose(jobId) {
    const confirmed = confirm(
      'Are you sure you want to close this job posting?'
    );

    if (!confirmed) return;

    try {
      await api.patch(`/jobs/${jobId}/close`, {});

      setJobs((prevJobs) =>
        prevJobs.filter((job) => job.id !== jobId)
      );

      // Refresh statistics
      const response = await api.get('/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to close job'
      );
    }
  }

  async function handleDelete(jobId) {
    const confirmed = confirm(
      'Delete this job posting? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await api.delete(`/jobs/${jobId}`);

      setJobs((prevJobs) =>
        prevJobs.filter((job) => job.id !== jobId)
      );

      // Refresh statistics
      const response = await api.get('/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to delete job'
      );
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Employer Dashboard
        </h1>

        <p className="text-gray-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">

        <div>
          <h1 className="text-2xl font-bold">
            Employer Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your job postings and applicants
          </p>
        </div>

        <Link
          href="/employer/post-job"
          className="bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition"
        >
          + Post a Job
        </Link>
      </div>


      {/* ================= ERROR ================= */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
          {error}
        </div>
      )}


      {/* ================= STATISTICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <StatCard
          label="Jobs Posted"
          value={stats?.totalJobsPosted}
        />

        <StatCard
          label="Open Jobs"
          value={stats?.openJobs}
        />

        <StatCard
          label="Closed Jobs"
          value={stats?.closedJobs}
        />

        <StatCard
          label="Total Applicants"
          value={stats?.totalApplicants}
        />

      </div>


      {/* ================= OPEN JOBS ================= */}
      <div className="bg-white border rounded-xl p-6">

        <div className="flex justify-between items-center mb-5">

          <div>
            <h2 className="text-lg font-semibold">
              Your Open Jobs
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage your currently active job postings
            </p>
          </div>

          <span className="text-sm text-gray-500">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''}
          </span>

        </div>


        {/* ================= JOB LIST ================= */}
        <div className="space-y-4">

          {jobs.map((job) => (

            <div
              key={job.id}
              className="border rounded-xl p-5 hover:shadow-sm transition"
            >

              {/* Job information */}
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">

                <div>

                  <h3 className="font-semibold text-lg">
                    {job.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">

                    {job.location && (
                      <span>
                        📍 {job.location}
                      </span>
                    )}

                    {job.work_mode && (
                      <span>
                        💼 {job.work_mode}
                      </span>
                    )}

                    {job.employment_type && (
                      <span>
                        🕒 {job.employment_type}
                      </span>
                    )}

                  </div>

                </div>


                {/* ================= ACTIONS ================= */}
                <div className="flex flex-wrap gap-3 text-sm">

                  {/* View */}
                  <Link
                    href={`/jobs/${job.id}`}
                    className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
                  >
                    View
                  </Link>


                  {/* Edit */}
                  {/* IMPORTANT:
                      Your edit page is:
                      /jobs/[id]/edit/page.jsx
                  */}
                  <Link
                    href={`/jobs/${job.id}/edit`}
                    className="px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100"
                  >
                    Edit
                  </Link>


                  {/* Applicants */}
                  <Link
                   href={`/jobs/${job.id}/applicants`}
                   className="px-3 py-2 rounded-lg bg-green-50 text-green-600 font-medium hover:bg-green-100"
                   >
                    Applicants
                      </Link>


                  {/* Close */}
                  <button
                    onClick={() => handleClose(job.id)}
                    className="px-3 py-2 rounded-lg bg-yellow-50 text-yellow-600 font-medium hover:bg-yellow-100"
                  >
                    Close
                  </button>


                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="px-3 py-2 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100"
                  >
                    Delete
                  </button>

                </div>

              </div>

            </div>

          ))}


          {/* ================= NO JOBS ================= */}
          {jobs.length === 0 && (

            <div className="text-center py-10">

              <p className="text-gray-500 mb-4">
                No open jobs yet.
              </p>

              <Link
                href="/employer/post-job"
                className="inline-block bg-brand-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-brand-700"
              >
                Post Your First Job
              </Link>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


/* ================= STAT CARD ================= */

function StatCard({ label, value }) {

  return (
    <div className="bg-white border rounded-xl p-5">

      <p className="text-3xl font-bold text-brand-600">
        {value ?? 0}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        {label}
      </p>

    </div>
  );
}