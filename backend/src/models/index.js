const sequelize = require('../config/db');
const User = require('./User');
const Role = require('./Role');
const Company = require('./Company');
const Job = require('./Job');
const Application = require('./Application');
const SavedJob = require('./SavedJob');
const ScrapeLog = require('./ScrapeLog');

// Role <-> User
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id' });

// User (employer) <-> Company
User.hasMany(Company, { foreignKey: 'owner_id', as: 'ownedCompanies' });
Company.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// Company <-> Job
Company.hasMany(Job, { foreignKey: 'company_id', as: 'jobs' });
Job.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });

// User (employer, posted_by) <-> Job
User.hasMany(Job, { foreignKey: 'posted_by', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'posted_by', as: 'poster' });

// Job <-> Application
Job.hasMany(Application, { foreignKey: 'job_id', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// User (candidate) <-> Application
User.hasMany(Application, { foreignKey: 'candidate_id', as: 'applications', onDelete: 'CASCADE' });
Application.belongsTo(User, { foreignKey: 'candidate_id', as: 'candidate' });

// Job <-> SavedJob
Job.hasMany(SavedJob, { foreignKey: 'job_id', onDelete: 'CASCADE' });
SavedJob.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// User (candidate) <-> SavedJob
User.hasMany(SavedJob, { foreignKey: 'candidate_id', onDelete: 'CASCADE' });
SavedJob.belongsTo(User, { foreignKey: 'candidate_id', as: 'candidate' });

module.exports = {
  sequelize,
  User,
  Role,
  Company,
  Job,
  Application,
  SavedJob,
  ScrapeLog,
};
