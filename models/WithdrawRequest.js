const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const User = require('./User');

const WithdrawRequest = sequelize.define('WithdrawRequest', {
  methodName: {
        type: DataTypes.STRING,
        allowNull: false
      },
  senderAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userName:{
    type: DataTypes.STRING,
    allowNull: false
  },

}, {
    // Other model options
    timestamps: true  
  });

  WithdrawRequest.belongsTo(User, { foreignKey: 'userName', targetKey: 'userName' });
  module.exports = WithdrawRequest