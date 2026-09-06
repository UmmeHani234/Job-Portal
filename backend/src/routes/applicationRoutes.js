const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getApplications, updateApplicationStatus } = require('../controllers/applicationController');

/**
 * @swagger
 * /applications:
 *   get:
 *     summary: List applications (scoped by role - candidate sees own, employer sees own jobs', admin sees all)
 *     tags: [Applications]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Paginated applications }
 */
router.get('/', authenticate, getApplications);

/**
 * @swagger
 * /applications/{id}/status:
 *   patch:
 *     summary: Update application status (Employer of the job, or Admin)
 *     tags: [Applications]
 *     security: [{ bearerAuth: [] }]
 */
router.patch('/:id/status', authenticate, updateApplicationStatus);

module.exports = router;
