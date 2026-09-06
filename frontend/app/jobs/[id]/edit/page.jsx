'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id;

  const [form, setForm] = useState({
    title: '',
    location: '',
    work_mode: 'ONSITE',
    employment_type: 'FULL_TIME',
    salary_min: '',
    salary_max: '',
    salary_currency: 'INR',
    experience_min: '',
    experience_max: '',
    skills: '',
    description: '',
    benefits: '',
    deadline: '',
    status: 'OPEN',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch existing job
  useEffect(() => {
    if (!jobId) return;

    async function fetchJob() {
      try {
        setLoading(true);
        setError('');

        const res = await api.get(`/jobs/${jobId}`);
        const job = res.data;

        setForm({
          title: job.title || '',
          location: job.location || '',
          work_mode: job.work_mode || 'ONSITE',
          employment_type: job.employment_type || 'FULL_TIME',
          salary_min: job.salary_min ?? '',
          salary_max: job.salary_max ?? '',
          salary_currency: job.salary_currency || 'INR',
          experience_min: job.experience_min ?? '',
          experience_max: job.experience_max ?? '',
          skills: Array.isArray(job.skills)
            ? job.skills.join(', ')
            : job.skills || '',
          description: job.description || '',
          benefits: job.benefits || '',
          deadline: job.deadline
            ? String(job.deadline).substring(0, 10)
            : '',
          status: job.status || 'OPEN',
        });
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load job'
        );
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError('');

      const payload = {
        title: form.title,
        location: form.location,
        work_mode: form.work_mode,
        employment_type: form.employment_type,

        salary_min:
          form.salary_min === ''
            ? null
            : Number(form.salary_min),

        salary_max:
          form.salary_max === ''
            ? null
            : Number(form.salary_max),

        salary_currency: form.salary_currency,

        experience_min:
          form.experience_min === ''
            ? 0
            : Number(form.experience_min),

        experience_max:
          form.experience_max === ''
            ? null
            : Number(form.experience_max),

        skills: form.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),

        description: form.description,
        benefits: form.benefits,
        deadline: form.deadline || null,
        status: form.status,
      };

      await api.put(`/jobs/${jobId}`, payload);

      alert('Job updated successfully!');

      router.push('/employer/dashboard');
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to update job'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <p className="text-gray-500">
          Loading job details...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Edit Job
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-5">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl p-6 space-y-5"
      >
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Job Title
          </label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Location
          </label>

          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Work Mode + Employment Type */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Work Mode
            </label>

            <select
              name="work_mode"
              value={form.work_mode}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Employment Type
            </label>

            <select
              name="employment_type"
              value={form.employment_type}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Salary
          </label>

          <div className="grid grid-cols-3 gap-3">
            <input
              type="number"
              name="salary_min"
              placeholder="Minimum"
              value={form.salary_min}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              name="salary_max"
              placeholder="Maximum"
              value={form.salary_max}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="text"
              name="salary_currency"
              placeholder="Currency"
              value={form.salary_currency}
              onChange={handleChange}
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Experience */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Experience (Years)
          </label>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="experience_min"
              placeholder="Minimum"
              value={form.experience_min}
              onChange={handleChange}
              min="0"
              className="border rounded-lg px-3 py-2"
            />

            <input
              type="number"
              name="experience_max"
              placeholder="Maximum"
              value={form.experience_max}
              onChange={handleChange}
              min="0"
              className="border rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Skills
          </label>

          <input
            type="text"
            name="skills"
            value={form.skills}
            onChange={handleChange}
            placeholder="Java, React, SQL, Node.js"
            className="w-full border rounded-lg px-3 py-2"
          />

          <p className="text-xs text-gray-500 mt-1">
            Separate skills using commas.
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Job Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={6}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Benefits
          </label>

          <textarea
            name="benefits"
            value={form.benefits}
            onChange={handleChange}
            rows={4}
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Application Deadline
          </label>

          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Status
          </label>

          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border rounded-lg px-3 py-2"
          >
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() =>
              router.push('/employer/dashboard')
            }
            className="border px-5 py-2 rounded-lg font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}