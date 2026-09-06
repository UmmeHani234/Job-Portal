const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class ScrapeLog extends Model {}

ScrapeLog.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    source: { type: DataTypes.STRING(50), allowNull: false },
    jobs_added: { type: DataTypes.INTEGER, defaultValue: 0 },
    duplicates_skipped: { type: DataTypes.INTEGER, defaultValue: 0 },
    errors: { type: DataTypes.INTEGER, defaultValue: 0 },
    error_details: DataTypes.JSONB,
    started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    finished_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'ScrapeLog',
    tableName: 'scrape_logs',
    timestamps: false,
  }
);

module.exports = ScrapeLog;
