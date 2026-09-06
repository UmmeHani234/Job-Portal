import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Find your next job, <span className="text-brand-600">faster.</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Search thousands of roles from employers and public job feeds — filter by skills,
          location, salary and work mode, and apply in a click.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/jobs"
            className="bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700"
          >
            Browse Jobs
          </Link>
          <Link
            href="/register"
            className="border border-brand-600 text-brand-600 px-6 py-3 rounded-lg font-medium hover:bg-brand-50"
          >
            Create an Account
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-2">For Candidates</h3>
          <p className="text-gray-600 text-sm">
            Search and filter jobs by skill, location and salary. Save jobs for later and track
            every application from one dashboard.
          </p>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-2">For Employers</h3>
          <p className="text-gray-600 text-sm">
            Post roles, manage applicants, and shortlist candidates — all from a single employer
            dashboard.
          </p>
        </div>
        <div className="bg-white border rounded-xl p-6">
          <h3 className="font-semibold text-lg mb-2">Always Fresh</h3>
          <p className="text-gray-600 text-sm">
            Our scraper pulls in new public job listings automatically every 6 hours, so the board
            never goes stale.
          </p>
        </div>
      </section>
    </div>
  );
}
