'use client';

import { useEffect, useState } from 'react';
import { api } from '../../../lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data)).catch((err) => setError(err.message));
  }, []);

  async function handleScrape() {
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await api.post('/scrape/jobs', {});
      setScrapeResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setScraping(false);
    }
  }

  if (!stats) return <p className="text-gray-500">Loading dashboard...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleScrape}
          disabled={scraping}
          className="bg-brand-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {scraping ? 'Scraping...' : 'Run Scraper Now'}
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {scrapeResult && (
        <p className="mb-6 text-sm bg-green-50 text-green-800 border border-green-100 rounded-lg p-3">
          Added {scrapeResult.jobsAdded}, skipped {scrapeResult.duplicatesSkipped} duplicates, {scrapeResult.errors} errors.
        </p>
      )}

      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Total Jobs" value={stats.totalJobs} />
        <StatCard label="Companies" value={stats.totalCompanies} />
        <StatCard label="Applications" value={stats.totalApplications} />
        <StatCard label="Scraped Today" value={stats.jobsScrapedToday} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <ListCard title="Top Skills" items={stats.topSkills} labelKey="skill" />
        <ListCard title="Top Companies" items={stats.topCompanies} labelKey="company.name" />
        <ListCard title="Top Locations" items={stats.topLocations} labelKey="location" />
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white border rounded-xl p-5 text-center">
      <p className="text-2xl font-bold text-brand-600">{value ?? 0}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function ListCard({ title, items = [], labelKey }) {
  function getLabel(item) {
    return labelKey.split('.').reduce((acc, key) => acc?.[key], item) ?? 'Unknown';
  }
  return (
    <div className="bg-white border rounded-xl p-5">
      <h3 className="font-semibold mb-3">{title}</h3>
      <ul className="space-y-2 text-sm text-gray-700">
        {items.map((item, i) => (
          <li key={i} className="flex justify-between">
            <span>{getLabel(item)}</span>
            <span className="text-gray-400">{item.count ?? item.jobCount}</span>
          </li>
        ))}
        {items.length === 0 && <li className="text-gray-400">No data yet</li>}
      </ul>
    </div>
  );
}
