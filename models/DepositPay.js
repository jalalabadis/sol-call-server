const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const DepositPay = sequelize.define('DepositPay', {
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
  receiverAddress: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: false
  },
  depositImage: {
    type: DataTypes.STRING,
    allowNull: false
  },

}, {
    // Other model options
    timestamps: true  // Adds createdAt and updatedAt fields
  });

  module.exports = DepositPay;