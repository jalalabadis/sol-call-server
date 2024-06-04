const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const User = require('./User');

const Job = sequelize.define('Job', {
  targetZone:{
    type: DataTypes.STRING,
    allowNull: false
  }, 
  excludeCountry:{
    type: DataTypes.STRING,
    allowNull: true
  },
category:{
  type: DataTypes.STRING,
  allowNull: false
}, 
subCategory:{
  type: DataTypes.STRING,
  allowNull: false
}, 
workersNeed:{
  type: DataTypes.INTEGER,
  allowNull: false
}, 
taskDone:{
  type: DataTypes.INTEGER,
  allowNull: false
},
taskPay:{
  type: DataTypes.INTEGER,
  allowNull: false
},
taskCancel:{
  type: DataTypes.INTEGER,
  allowNull: false
},
taskCost:{
  type: DataTypes.DECIMAL(10, 4),
  allowNull: false
},
ttr:{
  type: DataTypes.INTEGER,
  allowNull: false
}, 
pace:{
  type: DataTypes.INTEGER,
  allowNull: false
}, 
taskSpread:{
  type: DataTypes.INTEGER,
  allowNull: false
}, 
ratingType:{
  type: DataTypes.STRING,
  allowNull: false
}, 
jobTitle:{
  type: DataTypes.STRING,
  allowNull: false
}, 
jobRequirement:{
  type: DataTypes.STRING,
  allowNull: false
},
proof1:{
  type: DataTypes.STRING,
  allowNull: false
}, 
proof1Type:{
  type: DataTypes.STRING,
  allowNull: false
}, 
proof2:{
  type: DataTypes.STRING,
  allowNull: true
}, 
proof2Type:{
  type: DataTypes.STRING,
  allowNull: true
}, 
proof3:{
  type: DataTypes.STRING,
  allowNull: true
}, 
proof3Type:{
  type: DataTypes.STRING,
  allowNull: true
}, 
proof4:{
  type: DataTypes.STRING,
  allowNull: true
}, 
proof4Type:{
  type: DataTypes.STRING,
  allowNull: true
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

  Job.belongsTo(User, { foreignKey: 'userName', targetKey: 'userName' });

  module.exports = Job;