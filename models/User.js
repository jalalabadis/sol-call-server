const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const User = sequelize.define('User', {
  //User Info
  wallet:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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
  last_play: {
    type: DataTypes.DATE,
    allowNull: false
      },
  
  ////Mony
  earned: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  }

}, {
  // Other model options
  timestamps: true  // Adds createdAt and updatedAt fields
});


module.exports = User;
