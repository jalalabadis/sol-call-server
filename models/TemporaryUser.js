const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const TemporaryUser = sequelize.define('TemporaryUser', {
  // Define the model attributes
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userName:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password:{
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  referral: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ip:{
    type: DataTypes.STRING,
    allowNull: false
  },
  token:{
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  // Other model options
  timestamps: true  // Adds createdAt and updatedAt fields
});

module.exports = TemporaryUser;
