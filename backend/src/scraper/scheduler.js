const cron = require('node-cron');
const { runScrape, SOURCE_NAME } = require('./remoteOkScraper');
const { ScrapeLog } = require('../models');

function startScheduler() {
  if (process.env.SCRAPE_CRON_ENABLED !== 'true') {
    console.log('Scrape scheduler disabled (SCRAPE_CRON_ENABLED != true)');
    return;
  }

  const schedule = process.env.SCRAPE_CRON_SCHEDULE || '0 */6 * * *'; // every 6 hours

  cron.schedule(schedule, async () => {
    console.log(`[scheduler] Running scheduled scrape for ${SOURCE_NAME}...`);
    const log = await ScrapeLog.create({ source: SOURCE_NAME, started_at: new Date() });
    const result = await runScrape();
    await log.update({
      jobs_added: result.added,
      duplicates_skipped: result.duplicates,
      errors: result.errors,
      error_details: result.errorDetails,
      finished_at: new Date(),
    });
    console.log('[scheduler] Scrape complete:', result);
  });

  console.log(`Scrape scheduler started with cron pattern "${schedule}"`);
}

module.exports = { startScheduler };
