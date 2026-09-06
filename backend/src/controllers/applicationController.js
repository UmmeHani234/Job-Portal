const { Application, Job, Company } = require('../models');

// GET /applications
// CANDIDATE -> their own applications
// EMPLOYER  -> applications to jobs they posted
// ADMIN     -> all applications
async function getApplications(req, res, next) {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const where = {};
    if (status) where.status = status;

    let jobFilter = {};
    if (req.user.role === 'CANDIDATE') {
      where.candidate_id = req.user.id;
    } else if (req.user.role === 'EMPLOYER') {
      jobFilter = { posted_by: req.user.id };
    }
    // ADMIN: no extra filter

    const { rows, count } = await Application.findAndCountAll({
      where,
      include: [
        {
          model: Job,
          as: 'job',
          where: Object.keys(jobFilter).length ? jobFilter : undefined,
          include: [{ model: Company, as: 'company', attributes: ['id', 'name'] }],
        },
      ],
      order: [['applied_at', 'DESC']],
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      distinct: true,
    });

    res.json({
      success: true,
      data: rows,
      pagination: { total: count, page: pageNum, limit: limitNum, totalPages: Math.ceil(count / limitNum) },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /applications/:id/status  (EMPLOYER of the job, or ADMIN)
// body: { status: 'SHORTLISTED' | 'REJECTED' | 'HIRED' }
async function updateApplicationStatus(req, res, next) {
  try {
    const application = await Application.findByPk(req.params.id, { include: [{ model: Job, as: 'job' }] });
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (req.user.role !== 'ADMIN' && application.job.posted_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
    }

    const { status } = req.body;
    const allowed = ['APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `status must be one of ${allowed.join(', ')}` });
    }

    application.status = status;
    await application.save();
    res.json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
}

module.exports = { getApplications, updateApplicationStatus };
