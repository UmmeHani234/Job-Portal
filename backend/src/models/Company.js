const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Company extends Model {}

Company.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    owner_id: DataTypes.UUID,
    name: { type: DataTypes.STRING(160), allowNull: false, unique: true },
    website: DataTypes.STRING(255),
    logo_url: DataTypes.TEXT,
    location: DataTypes.STRING(160),
    description: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: 'Company',
    tableName: 'companies',
  }
);

module.exports = Company;
