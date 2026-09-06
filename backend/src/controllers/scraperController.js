const { runScrape, SOURCE_NAME } = require('../scraper/remoteOkScraper');
const { ScrapeLog } = require('../models');

// POST /scrape/jobs  (ADMIN only)
async function triggerScrape(req, res, next) {
  try {
    const log = await ScrapeLog.create({ source: SOURCE_NAME, started_at: new Date() });

    const result = await runScrape();

    await log.update({
      jobs_added: result.added,
      duplicates_skipped: result.duplicates,
      errors: result.errors,
      error_details: result.errorDetails,
      finished_at: new Date(),
    });

    res.json({
      success: true,
      data: {
        source: SOURCE_NAME,
        jobsAdded: result.added,
        duplicatesSkipped: result.duplicates,
        errors: result.errors,
        errorDetails: result.errorDetails,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /scrape/logs (ADMIN only) - history of scrape runs
async function getScrapeLogs(req, res, next) {
  try {
    const logs = await ScrapeLog.findAll({ order: [['started_at', 'DESC']], limit: 50 });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

module.exports = { triggerScrape, getScrapeLogs };
