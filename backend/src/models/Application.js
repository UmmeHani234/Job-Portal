const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Application extends Model {}

Application.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    job_id: { type: DataTypes.UUID, allowNull: false },
    candidate_id: { type: DataTypes.UUID, allowNull: false },
    resume_url: DataTypes.TEXT,
    cover_letter: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED'),
      defaultValue: 'APPLIED',
    },
    applied_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'Application',
    tableName: 'applications',
    timestamps:false,
    indexes: [{ unique: true, fields: ['job_id', 'candidate_id'] }],
  }
);

module.exports = Application;
