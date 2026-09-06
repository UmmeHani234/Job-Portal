import Link from 'next/link';

export default function JobCard({ job }) {
  const salaryText =
    job.salary_min || job.salary_max
      ? `${job.salary_currency || 'INR'} ${job.salary_min ?? '?'} - ${job.salary_max ?? '?'}`
      : 'Not disclosed';

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block bg-white border rounded-xl p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
          <p className="text-sm text-gray-500">{job.company?.name || 'Unknown Company'} · {job.location || 'N/A'}</p>
        </div>
        {job.source && job.source !== 'MANUAL' && (
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
            via {job.source}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {job.work_mode && (
          <span className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">{job.work_mode}</span>
        )}
        {job.employment_type && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
            {job.employment_type.replace('_', ' ')}
          </span>
        )}
        {(job.skills || []).slice(0, 4).map((skill) => (
          <span key={skill} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
        <span>{salaryText}</span>
        <span>{new Date(job.posted_date).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
