const Task = require('../models/Task');
const { Sequelize, Op, DataTypes } = require('sequelize');


const onUserSuccessRate = async(username) => {
  try{
  const now = new Date();
const oneMonthAgo = new Date(now - 1000 * 60 * 60 * 24 * 30); 

// Fetch tasks updated in the last month
const tasks = await Task.findAll({
  where: {
    updatedAt: { [Sequelize.Op.gt]: oneMonthAgo},
    userName: username
  }
});



const successTask = tasks.filter(item => item.status === "approved");
const successRate = tasks.length > 0 ? (successTask.length / tasks.length) * 100 : 0;
console.log(tasks.length, successTask.length)

  return successRate;
}
catch(err){
  return err;
}
};

  module.exports = onUserSuccessRate