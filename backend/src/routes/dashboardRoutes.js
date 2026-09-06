const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboardController');

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Role-scoped dashboard stats (Candidate / Employer / Admin)
 *     tags: [Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard payload shaped by the caller's role }
 */
router.get('/', authenticate, getDashboard);

module.exports = router;
