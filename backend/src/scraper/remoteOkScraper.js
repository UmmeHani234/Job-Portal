/**
 * RemoteOK scraper.
 *
 * RemoteOK exposes a public, documented JSON API (https://remoteok.com/api)
 * explicitly intended for programmatic/automated consumption - no HTML
 * scraping or ToS violation involved. This keeps Module 5's requirement
 * ("sources that permit automated access / public feeds") clean.
 *
 * Swap REMOTEOK_API_URL for any other public jobs API/feed if desired -
 * the dedup + persistence logic below is source-agnostic.
 */
const { Company, Job } = require('../models');

const SOURCE_NAME = 'REMOTEOK';

async function fetchRawJobs() {
  const url = process.env.REMOTEOK_API_URL || 'https://remoteok.com/api';
  const response = await fetch(url, {
    headers: {
      // RemoteOK asks for a descriptive User-Agent on API consumers
      'User-Agent': 'JobPortalScraper/1.0 (educational project)',
    },
  });

  if (!response.ok) {
    throw new Error(`RemoteOK API responded with status ${response.status}`);
  }

  const json = await response.json();
  // First element of RemoteOK's response is a legal/metadata notice, not a job
  return Array.isArray(json) ? json.filter((item) => item.id && item.position) : [];
}

function normalizeJob(raw) {
  return {
    source: SOURCE_NAME,
    source_url: raw.url || `https://remoteok.com/remote-jobs/${raw.id}`,
    companyName: raw.company || 'Unknown Company',
    title: raw.position || raw.title,
    location: raw.location || 'Remote',
    description: (raw.description || '').slice(0, 8000), // guard against oversized text
    skills: Array.isArray(raw.tags) ? raw.tags.slice(0, 20) : [],
    posted_date: raw.date ? new Date(raw.date) : new Date(),
    salary_min: raw.salary_min || null,
    salary_max: raw.salary_max || null,
  };
}

/**
 * Runs one scrape pass. Returns { added, duplicates, errors, errorDetails }.
 */
async function runScrape() {
  const result = { added: 0, duplicates: 0, errors: 0, errorDetails: [] };

  let rawJobs;
  try {
    rawJobs = await fetchRawJobs();
  } catch (err) {
    result.errors += 1;
    result.errorDetails.push({ stage: 'fetch', message: err.message });
    return result;
  }

  for (const raw of rawJobs) {
    try {
      const normalized = normalizeJob(raw);

      // Deduplication: unique (source, source_url) constraint on jobs table.
      const existing = await Job.findOne({
        where: { source: normalized.source, source_url: normalized.source_url },
      });
      if (existing) {
        result.duplicates += 1;
        continue;
      }

      const [company] = await Company.findOrCreate({
        where: { name: normalized.companyName },
        defaults: { name: normalized.companyName },
      });

      await Job.create({
        company_id: company.id,
        posted_by: null,
        title: normalized.title,
        location: normalized.location,
        work_mode: 'REMOTE',
        employment_type: 'FULL_TIME',
        salary_min: normalized.salary_min,
        salary_max: normalized.salary_max,
        skills: normalized.skills,
        description: normalized.description || 'No description provided.',
        status: 'OPEN',
        source: normalized.source,
        source_url: normalized.source_url,
        posted_date: normalized.posted_date,
      });

      result.added += 1;
    } catch (err) {
      result.errors += 1;
      result.errorDetails.push({ stage: 'persist', message: err.message, raw_id: raw.id });
    }
  }

  return result;
}

module.exports = { runScrape, SOURCE_NAME };
