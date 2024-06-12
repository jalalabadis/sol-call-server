const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const User = require('./User');

const Support = sequelize.define('Support', {
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userName:{
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: User,
      key: 'userName'
    }
  }

}, {
    // Other model options
    timestamps: true  
  });

  Support.belongsTo(User, { foreignKey: 'userName', targetKey: 'userName' });
  module.exports = Support;