const { Op } = require('sequelize');
const { Job, Company, Application, SavedJob, User } = require('../models');

// GET /jobs
// query: page, limit, search, location, work_mode, employment_type, skills (csv),
//        salary_min, salary_max, experience_max, sort ('newest'|'oldest'|'salary_high'|'salary_low')
async function getJobs(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      work_mode,
      employment_type,
      skills,
      salary_min,
      experience_max,
      sort = 'newest',
      status = 'OPEN',
    } = req.query;

    const where = {};
    if (status) where.status = status;
    if (location) where.location = { [Op.iLike]: `%${location}%` };
    if (work_mode) where.work_mode = work_mode;
    if (employment_type) where.employment_type = employment_type;
    if (salary_min) where.salary_max = { [Op.gte]: Number(salary_min) };
    if (experience_max) where.experience_min = { [Op.lte]: Number(experience_max) };
    if (skills) {
      const skillList = skills.split(',').map((s) => s.trim());
      where.skills = { [Op.overlap]: skillList };
    }
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const sortMap = {
      newest: [['posted_date', 'DESC']],
      oldest: [['posted_date', 'ASC']],
      salary_high: [['salary_max', 'DESC']],
      salary_low: [['salary_min', 'ASC']],
    };
    const order = sortMap[sort] || sortMap.newest;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));

    const { rows, count } = await Job.findAndCountAll({
      where,
      include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'logo_url', 'location'] }],
      order,
      limit: limitNum,
      offset: (pageNum - 1) * limitNum,
      distinct: true,
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /jobs/:id
async function getJobById(req, res, next) {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [{ model: Company, as: 'company' }],
    });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

// POST /jobs  (EMPLOYER only)
async function createJob(req, res, next) {
  try {
    const {
      company_id, company_name, title, location, work_mode, employment_type,
      salary_min, salary_max, salary_currency, experience_min, experience_max,
      skills, description, benefits, deadline,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'title and description are required' });
    }

    let resolvedCompanyId = company_id;
    if (!resolvedCompanyId && company_name) {
      const [company] = await Company.findOrCreate({
        where: { name: company_name },
        defaults: { owner_id: req.user.id },
      });
      resolvedCompanyId = company.id;
    }
    if (!resolvedCompanyId) {
      return res.status(400).json({ success: false, message: 'company_id or company_name is required' });
    }

    const job = await Job.create({
      company_id: resolvedCompanyId,
      posted_by: req.user.id,
      title, location, work_mode, employment_type,
      salary_min, salary_max, salary_currency,
      experience_min, experience_max,
      skills, description, benefits, deadline,
      source: 'MANUAL',
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

// PUT /jobs/:id (EMPLOYER owner or ADMIN)
async function updateJob(req, res, next) {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (req.user.role !== 'ADMIN' && job.posted_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not own this job posting' });
    }

    const updatable = [
      'title', 'location', 'work_mode', 'employment_type', 'salary_min', 'salary_max',
      'salary_currency', 'experience_min', 'experience_max', 'skills', 'description',
      'benefits', 'deadline', 'status',
    ];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = req.body[field];
    });

    await job.save();
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

// DELETE /jobs/:id (EMPLOYER owner or ADMIN)
async function deleteJob(req, res, next) {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (req.user.role !== 'ADMIN' && job.posted_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not own this job posting' });
    }

    await job.destroy();
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
}

// PATCH /jobs/:id/close (EMPLOYER owner or ADMIN) - convenience endpoint
async function closeJob(req, res, next) {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (req.user.role !== 'ADMIN' && job.posted_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not own this job posting' });
    }
    job.status = 'CLOSED';
    await job.save();
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

// GET /jobs/:id/applicants (EMPLOYER owner or ADMIN)
async function getApplicants(req, res, next) {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (req.user.role !== 'ADMIN' && job.posted_by !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You do not own this job posting' });
    }

    const applicants = await Application.findAll({
      where: { job_id: job.id },
      include: [{ model: User, as: 'candidate', attributes: ['id', 'name', 'email', 'phone', 'resume_url'] }],
      order: [['applied_at', 'DESC']],
    });

    res.json({ success: true, data: applicants });
  } catch (err) {
    next(err);
  }
}

// POST /jobs/:id/apply (CANDIDATE only)
async function applyToJob(req, res, next) {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    if (job.status !== 'OPEN') {
      return res.status(400).json({ success: false, message: 'This job is not accepting applications' });
    }

    const existing = await Application.findOne({
      where: { job_id: job.id, candidate_id: req.user.id },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You already applied to this job' });
    }

    const { resume_url, cover_letter } = req.body;
    const application = await Application.create({
      job_id: job.id,
      candidate_id: req.user.id,
      resume_url,
      cover_letter,
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
}

// POST /jobs/:id/save (CANDIDATE only)
async function saveJob(req, res, next) {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const [saved, created] = await SavedJob.findOrCreate({
      where: { job_id: job.id, candidate_id: req.user.id },
    });

    res.status(created ? 201 : 200).json({ success: true, data: saved, alreadySaved: !created });
  } catch (err) {
    next(err);
  }
}

// DELETE /jobs/:id/save (CANDIDATE only)
async function unsaveJob(req, res, next) {
  try {
    await SavedJob.destroy({ where: { job_id: req.params.id, candidate_id: req.user.id } });
    res.json({ success: true, message: 'Removed from saved jobs' });
  } catch (err) {
    next(err);
  }
}

// GET /jobs/saved/me (CANDIDATE only)
async function getSavedJobs(req, res, next) {
  try {
    const saved = await SavedJob.findAll({
      where: { candidate_id: req.user.id },
      include: [{ model: Job, as: 'job', include: [{ model: Company, as: 'company' }] }],
      order: [['saved_at', 'DESC']],
    });
    res.json({ success: true, data: saved });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getJobs, getJobById, createJob, updateJob, deleteJob, closeJob,
  getApplicants, applyToJob, saveJob, unsaveJob, getSavedJobs,
};
