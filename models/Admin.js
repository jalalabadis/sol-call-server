const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Admin = sequelize.define('Admin', {
 
  userName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notify: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  support: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  percentage: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  minimum: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  maximum: {
    type: DataTypes.INTEGER,
    allowNull: false
  }

}, {
    // Other model options
    timestamps: true  // Adds createdAt and updatedAt fields
  });

  module.exports = Admin;