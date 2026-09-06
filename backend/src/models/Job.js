const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Job extends Model {}

Job.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    company_id: {
      type: DataTypes.UUID,
      allowNull: false
    },

    posted_by: DataTypes.UUID,

    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },

    location: DataTypes.STRING(160),

    work_mode: {
      type: DataTypes.ENUM('REMOTE', 'ONSITE', 'HYBRID')
    },

    employment_type: {
      type: DataTypes.ENUM(
        'FULL_TIME',
        'PART_TIME',
        'CONTRACT',
        'INTERNSHIP'
      )
    },

    salary_min: DataTypes.DECIMAL(12, 2),

    salary_max: DataTypes.DECIMAL(12, 2),

    salary_currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'INR'
    },

    experience_min: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },

    experience_max: DataTypes.INTEGER,

    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    benefits: DataTypes.TEXT,

    deadline: DataTypes.DATEONLY,

    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED', 'DRAFT'),
      defaultValue: 'OPEN'
    },

    source: {
      type: DataTypes.STRING(50),
      defaultValue: 'MANUAL'
    },

    source_url: DataTypes.TEXT,

    posted_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },

    is_duplicate_of: DataTypes.UUID
  },
  {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',

    // Prevent Sequelize from expecting created_at and updated_at
    timestamps: false,

    indexes: [
      {
        unique: true,
        fields: ['source', 'source_url'],
        where: {
          source_url: {
            [require('sequelize').Op.ne]: null
          }
        }
      }
    ]
  }
);

module.exports = Job;