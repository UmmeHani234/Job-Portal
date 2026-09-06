'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {api} from '../../../../lib/api';

export default function ApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;

  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId) return;

    async function fetchApplicants() {
      try {
        setLoading(true);
        setError('');

        const res = await api.get(`/jobs/${jobId}/applicants`);

        setApplicants(res.data || []);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load applicants'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchApplicants();
  }, [jobId]);

  async function updateStatus(applicationId, status) {
    try {
      await api.patch(`/applications/${applicationId}/status`, {
        status,
      });

      setApplicants((prev) =>
        prev.map((application) =>
          application.id === applicationId
            ? { ...application, status }
            : application
        )
      );
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          err.message ||
          'Failed to update application status'
      );
    }
  }

  if (loading) {
    return (
      <div>
        <p className="text-gray-500">
          Loading applicants...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Job Applicants
          </h1>

          <p className="text-gray-500 mt-1">
            Candidates who applied for this job
          </p>
        </div>

        <button
          onClick={() => router.push('/employer/dashboard')}
          className="border px-4 py-2 rounded-lg font-medium"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-5">
          {error}
        </div>
      )}

      {/* No applicants */}
      {!error && applicants.length === 0 && (
        <div className="bg-white border rounded-xl p-6">
          <p className="text-gray-500">
            No applicants have applied for this job yet.
          </p>
        </div>
      )}

      {/* Applicants */}
      <div className="space-y-4">
        {applicants.map((application) => {
          const candidate = application.candidate || {};

          return (
            <div
              key={application.id}
              className="bg-white border rounded-xl p-5"
            >
              <div className="flex justify-between items-start gap-4">
                {/* Candidate Information */}
                <div>
                  <h2 className="text-lg font-semibold">
                    {candidate.name || 'Candidate'}
                  </h2>

                  <p className="text-sm text-gray-600 mt-1">
                    {candidate.email || 'No email'}
                  </p>

                  {candidate.phone && (
                    <p className="text-sm text-gray-600">
                      {candidate.phone}
                    </p>
                  )}

                  {application.applied_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Applied:{' '}
                      {new Date(
                        application.applied_at
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Application Status */}
                <select
                  value={application.status || 'APPLIED'}
                  onChange={(e) =>
                    updateStatus(
                      application.id,
                      e.target.value
                    )
                  }
                  className="border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="APPLIED">
                    Applied
                  </option>

                  <option value="SHORTLISTED">
                    Shortlisted
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>

                  <option value="HIRED">
                    Hired
                  </option>
                </select>
              </div>

              {/* Resume */}
              {candidate.resume_url && (
                <div className="mt-4">
                  <a
                    href={candidate.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-600 font-medium text-sm"
                  >
                    View Resume
                  </a>
                </div>
              )}

              {/* Cover Letter */}
              {application.cover_letter && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">
                    Cover Letter
                  </p>

                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {application.cover_letter}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}