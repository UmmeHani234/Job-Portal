const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { triggerScrape, getScrapeLogs } = require('../controllers/scraperController');

/**
 * @swagger
 * /scrape/jobs:
 *   post:
 *     summary: Trigger a scrape run against the configured public jobs source (Admin only)
 *     tags: [Scraper]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: "Scrape summary: jobsAdded, duplicatesSkipped, errors" }
 */
router.post('/jobs', authenticate, authorize('ADMIN'), triggerScrape);
router.get('/logs', authenticate, authorize('ADMIN'), getScrapeLogs);

module.exports = router;
