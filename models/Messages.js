const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const User = require('./User');
const Support = require('./Support');

const Messages = sequelize.define('Messages', {
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sender_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  supportID:{
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Support,
      key: 'id'
    }
  },
  userName:{
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: User,
      key: 'userName'
    }
  }

}, {
    // Other model options
    timestamps: true  
  });

  Messages.belongsTo(User, { foreignKey: 'userName', targetKey: 'userName' });
  Messages.belongsTo(Support, { foreignKey: 'supportID', targetKey: 'id' });

  module.exports = Messages;