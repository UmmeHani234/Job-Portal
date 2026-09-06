const { Op, fn, col, literal } = require('sequelize');
const { User, Job, Company, Application, SavedJob } = require('../models');

// GET /dashboard
// Response shape depends on req.user.role
async function getDashboard(req, res, next) {
  try {
    if (req.user.role === 'ADMIN') return adminDashboard(req, res, next);
    if (req.user.role === 'EMPLOYER') return employerDashboard(req, res, next);
    return candidateDashboard(req, res, next);
  } catch (err) {
    next(err);
  }
}

async function candidateDashboard(req, res, next) {
  try {
    const [applications, saved] = await Promise.all([
      Application.count({ where: { candidate_id: req.user.id } }),
      SavedJob.count({ where: { candidate_id: req.user.id } }),
    ]);
    const byStatus = await Application.findAll({
      where: { candidate_id: req.user.id },
      attributes: ['status', [fn('COUNT', col('status')), 'count']],
      group: ['status'],
      raw: true,
    });

    res.json({
      success: true,
      data: { role: 'CANDIDATE', totalApplications: applications, totalSaved: saved, applicationsByStatus: byStatus },
    });
  } catch (err) {
    next(err);
  }
}

async function employerDashboard(req, res, next) {
  try {
    const jobs = await Job.findAll({ where: { posted_by: req.user.id }, attributes: ['id', 'status'] });
    const jobIds = jobs.map((j) => j.id);

    const totalApplicants = jobIds.length
      ? await Application.count({ where: { job_id: { [Op.in]: jobIds } } })
      : 0;

    res.json({
      success: true,
      data: {
        role: 'EMPLOYER',
        totalJobsPosted: jobs.length,
        openJobs: jobs.filter((j) => j.status === 'OPEN').length,
        closedJobs: jobs.filter((j) => j.status === 'CLOSED').length,
        totalApplicants,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function adminDashboard(req, res, next) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalUsers, totalJobs, totalCompanies, totalApplications, jobsScrapedToday,
    ] = await Promise.all([
      User.count(),
      Job.count(),
      Company.count(),
      Application.count(),
      Job.count({ where: { source: { [Op.ne]: 'MANUAL' }, created_at: { [Op.gte]: startOfDay } } }),
    ]);

    const topSkillsRaw = await Job.findAll({
      attributes: [[fn('unnest', col('skills')), 'skill'], [fn('COUNT', literal('*')), 'count']],
      group: ['skill'],
      order: [[literal('count'), 'DESC']],
      limit: 10,
      raw: true,
    });

    const topCompanies = await Job.findAll({
      attributes: ['company_id', [fn('COUNT', col('Job.id')), 'jobCount']],
      include: [{ model: Company, as: 'company', attributes: ['name'] }],
      group: ['company_id', 'company.id', 'company.name'],
      order: [[literal('"jobCount"'), 'DESC']],
      limit: 10,
      raw: true,
    });

    const topLocations = await Job.findAll({
      attributes: ['location', [fn('COUNT', col('id')), 'count']],
      where: { location: { [Op.ne]: null } },
      group: ['location'],
      order: [[literal('count'), 'DESC']],
      limit: 10,
      raw: true,
    });

    res.json({
      success: true,
      data: {
        role: 'ADMIN',
        totalUsers,
        totalJobs,
        totalCompanies,
        totalApplications,
        jobsScrapedToday,
        topSkills: topSkillsRaw,
        topCompanies,
        topLocations,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
