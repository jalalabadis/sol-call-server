const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const WithdrawPay = sequelize.define('WithdrawPay', {
    methodName: {
        type: DataTypes.STRING,
        allowNull: false
      },
    targetZone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  addressType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bankImage: {
    type: DataTypes.STRING,
    allowNull: false
  },

}, {
    // Other model options
    timestamps: true  // Adds createdAt and updatedAt fields
  });

  module.exports = WithdrawPay;