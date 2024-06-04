const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const User = require('./User');

const DepositRequest = sequelize.define('DepositRequest', {
  methodName: {
        type: DataTypes.STRING,
        allowNull: false
      },
  receiverAddress: {
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

  DepositRequest.belongsTo(User, { foreignKey: 'userName', targetKey: 'userName' });
  module.exports = DepositRequest;