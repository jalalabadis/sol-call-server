const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const User = sequelize.define('User', {
  //User Info
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
  gender:{
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar:{
    type: DataTypes.STRING,
    allowNull: false
  },
  skills:{
    type: DataTypes.STRING,
    allowNull: true
  },
  notes:{
    type: DataTypes.STRING,
    allowNull: true
  },
  ip:{
    type: DataTypes.STRING,
    allowNull: false
  },
  country:{
    type: DataTypes.STRING,
    allowNull: false
  },
  proxy:{
    type: DataTypes.STRING,
    allowNull: false
  },
  postalCode:{
    type: DataTypes.STRING,
    allowNull: true
  },
  SecretKey:{
    type: DataTypes.STRING,
    allowNull: false
  },
  otp:{
    type: DataTypes.STRING,
    allowNull: true
  },
  notify: {
    type: DataTypes.BOOLEAN,
    allowNull: true
  },
  ////User condition
  type:{
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  last_seen: {
    type: DataTypes.DATE,
    allowNull: false
      },
  ///affiliate
  referral: {
    type: DataTypes.STRING,
    allowNull: false
  },
  invite:{
    type: DataTypes.STRING,
    allowNull: false
  },
  ////Mony
  earned: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  pending: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  reserved: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  reward: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  totalEarned:{
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  
// Micro job Worker
tasksDone:{
  type: DataTypes.INTEGER,
  allowNull: false
},
satisfied:{
  type: DataTypes.INTEGER,
  allowNull: false
},
notSatisfied:{
  type: DataTypes.INTEGER,
  allowNull: false
},
lastSubmitted:{
  type: DataTypes.STRING,
  allowNull: true
},

//// Micro job Employer
jobsStarted:{
  type: DataTypes.INTEGER,
  allowNull: false
},
tasksPaid:{
  type: DataTypes.INTEGER,
  allowNull: false
},

}, {
  // Other model options
  timestamps: true  // Adds createdAt and updatedAt fields
});


module.exports = User;
