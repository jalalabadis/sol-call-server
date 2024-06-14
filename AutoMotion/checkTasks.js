const Task = require('../models/Task');
const Job = require('../models/Job');
const { Sequelize, Op, col, DataTypes } = require('sequelize');
const User = require('../models/User');

const checkTasks = async () => {
  
    try {
        const currentTime = new Date();

      
     // Find tasks where ttr has passed
    const tasksToUpdate = await  Task.findAll({
            include: [{
              model: Job,
              required: true,
              attributes: [] // We don't need Job attributes in the result
            }],
            where: {
              status: 'pending',
              [Op.and]: [
                // The raw SQL condition using Sequelize.fn and Sequelize.col
                Sequelize.where(
                  Sequelize.fn('TIMESTAMPADD', Sequelize.literal('DAY'), col('Job.ttr'), col('Task.updatedAt')),
                  {
                    [Op.lt]: currentTime
                  }
                )
              ]
            }
          });


          for (const task of tasksToUpdate) {
      const user = await User.findOne({ where: { userName: task.userName }});
      const job = await Job.findOne({ where: { id: task.jobID }});
      if(user&&job){
        await user.update({
          earned: parseFloat(user.earned)+parseFloat(job.taskCost),
          pending: parseFloat(user.pending)-parseFloat(job.taskCost),
          totalEarned: parseFloat(user.totalEarned)+parseFloat(job.taskCost),
          satisfied: user.satisfied+1,
        });

      /////Job update
      await job.update({
        taskPay: job.taskPay+1,
      });
      /////Task Update
      await task.update({
        status: 'approved',
      });
   
    };
        
};
console.log('Running scheduled task status update...'+ tasksToUpdate.length);  

    } catch (error) {
      console.error('Error checking tasks:', error);
    }
  };

  module.exports = checkTasks;