const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const AdminNotify = sequelize.define('AdminNotify', {
  // Define the model attributes
  seen: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  path: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  // Other model options
  timestamps: true  // Adds createdAt and updatedAt fields
});

module.exports = AdminNotify;
