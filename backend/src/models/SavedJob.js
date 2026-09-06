const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class SavedJob extends Model {}

SavedJob.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    candidate_id: { type: DataTypes.UUID, allowNull: false },
    job_id: { type: DataTypes.UUID, allowNull: false },
    saved_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'SavedJob',
    tableName: 'saved_jobs',
    timestamps: false,
    indexes: [{ unique: true, fields: ['candidate_id', 'job_id'] }],
  }
);

module.exports = SavedJob;
