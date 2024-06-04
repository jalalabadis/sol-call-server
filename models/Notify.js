const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Notify = sequelize.define('Notify', {
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
  },
  userName:{
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  // Other model options
  timestamps: true  // Adds createdAt and updatedAt fields
});

module.exports = Notify;
