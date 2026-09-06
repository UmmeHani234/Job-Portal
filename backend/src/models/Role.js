const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db');

class Role extends Model {}

Role.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: false,
  }
);

module.exports = Role;
