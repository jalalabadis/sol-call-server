const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const User = require('./User');
const Job = require('./Job');

const Task = sequelize.define('Task', {
proof1:{
  type: DataTypes.STRING,
  allowNull: false
}, 

proof2:{
  type: DataTypes.STRING,
  allowNull: true
}, 

proof3:{
  type: DataTypes.STRING,
  allowNull: true
}, 

proof4:{
  type: DataTypes.STRING,
  allowNull: true
}, 
reason:{
  type: DataTypes.STRING,
  allowNull: true
},
status: {
  type: DataTypes.STRING,
  allowNull: false
},
jobID:{
  type: DataTypes.INTEGER,
  allowNull: false,
  references: {
    model: Job,
    key: 'id'
  }
},
ip:{
  type: DataTypes.STRING,
  allowNull: false
},
country:{
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

  Task.belongsTo(User, { foreignKey: 'userName', targetKey: 'userName' });
  Task.belongsTo(Job, { foreignKey: 'jobID', targetKey: 'id' });
  module.exports = Task;