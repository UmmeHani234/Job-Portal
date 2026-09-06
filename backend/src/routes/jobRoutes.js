const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  getJobs, getJobById, createJob, updateJob, deleteJob, closeJob,
  getApplicants, applyToJob, saveJob, unsaveJob, getSavedJobs,
} = require('../controllers/jobController');

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: List/search/filter jobs (public)
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: location
 *         schema: { type: string }
 *       - in: query
 *         name: work_mode
 *         schema: { type: string, enum: [REMOTE, ONSITE, HYBRID] }
 *       - in: query
 *         name: employment_type
 *         schema: { type: string, enum: [FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP] }
 *       - in: query
 *         name: skills
 *         schema: { type: string, description: "comma separated" }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, oldest, salary_high, salary_low] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Paginated job list }
 *   post:
 *     summary: Create a job posting (Employer only)
 *     tags: [Jobs]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Job created }
 */
router.get('/', getJobs);
router.get('/saved/me', authenticate, authorize('CANDIDATE'), getSavedJobs);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get job details
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Job detail }
 *       404: { description: Not found }
 */
router.get('/:id', getJobById);

router.post('/', authenticate, authorize('EMPLOYER'), createJob);

/**
 * @swagger
 * /jobs/{id}:
 *   put:
 *     summary: Update a job posting (owner Employer or Admin)
 *     tags: [Jobs]
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     summary: Delete a job posting (owner Employer or Admin)
 *     tags: [Jobs]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/:id', authenticate, authorize('EMPLOYER', 'ADMIN'), updateJob);
router.delete('/:id', authenticate, authorize('EMPLOYER', 'ADMIN'), deleteJob);
router.patch('/:id/close', authenticate, authorize('EMPLOYER', 'ADMIN'), closeJob);

router.get('/:id/applicants', authenticate, authorize('EMPLOYER', 'ADMIN'), getApplicants);

/**
 * @swagger
 * /jobs/{id}/apply:
 *   post:
 *     summary: Apply to a job (Candidate only)
 *     tags: [Jobs]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Application submitted }
 *       409: { description: Already applied }
 */
router.post('/:id/apply', authenticate, authorize('CANDIDATE'), applyToJob);

router.post('/:id/save', authenticate, authorize('CANDIDATE'), saveJob);
router.delete('/:id/save', authenticate, authorize('CANDIDATE'), unsaveJob);

module.exports = router;
