const express = require('express');
const router = express.Router();
const path = require('path');
const Job = require('../models/Job');
const User = require('../models/User');
const Notify = require('../models/Notify');
const authCheck = require('../middlewares/authCheck');
const Task = require('../models/Task');
const { Sequelize, Op, DataTypes } = require('sequelize');
const adminCheck = require('../middlewares/adminCheck');




////Job add
router.post('/add', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){
      const user = await User.findOne({ where: { userName: req.userData?.userName }});
      if(user){
        const totalJobCost = (req.body.workersNeed*req.body.taskCost)+(req.body.promoteJob?1:0);
        if (totalJobCost>user.reserved) {
          res.status(500).json({Status: false, message:"Amount not found"});
          return;
        }
      await user.update({
        reserved: user.reserved-totalJobCost,
        jobsStarted: user.jobsStarted+1
      });
    await Job.create({
    targetZone: req.body.targetZone, 
    excludeCountry:req.body.excludeCountry,
    category:req.body.selectedCategory, 
    subCategory:req.body.selectedSubCategory, 
    workersNeed:req.body.workersNeed, 
    taskDone:0,
    taskPay:0,
    taskCancel:0,
    taskCost:req.body.taskCost,
    ttr:req.body.ttr, 
    pace:req.body.pace, 
    taskSpread:req.body.taskSpread,
    promote: req.body.promoteJob, 
    ratingType:req.body.ratingType, 
    jobTitle:req.body.jobTitle, 
    jobRequirement:req.body.jobRequirement,
    proof1:req.body.proof1, 
    proof1Type:req.body.proof1Type, 
    proof2:req.body.proof2, 
    proof2Type:req.body.proof2Type, 
    proof3:req.body.proof3, 
    proof3Type:req.body.proof3Type, 
    proof4:req.body.proof4, 
    proof4Type:req.body.proof4Type,
    status: "pending",
    userName: req.userData?.userName
    });

     //////Admin Notify add
     await AdminNotify.update(
      { notify: true },
      { where: { notify: false } }
    );    
     await AdminNotify.create({
      seen: true,
      message:  `New Job request by ${req.body.methodName} send ${req.userData?.userName}`,
      path: '/jobs',
     });

    res.status(200).json("Success");
  }
    else{
      res.status(500).send('Internal server error');
    }
  }
  else{
    res.status(500).send('Internal server error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});


////Job approve
router.post('/approve', async(req, res)=>{
    try {
      const jobData = await Job.findOne({ where: { id: req.body.id }});
        if(jobData){
      const user = await User.findOne({ where: { userName: jobData.userName }});
      if(user){
        // await user.update({
        //   reserved: user.reserved+jobData.amount,
        // });

      /////Deposit pay approve update
      await jobData.update({
        status: "approved",
      });
      const jobDatas = await Job.findAll();
      res.status(200).json(jobDatas);
    }
    else{
      res.status(500).send('Internal server error');
  }
  }
    else{
        res.status(500).send('Internal server error');
    }
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });


////Job Cancel
router.post('/cancel', async(req, res)=>{
  try {
    const jobData = await Job.findOne({ where: { id: req.body.id }});
      if(jobData){
    const user = await User.findOne({ where: { userName: jobData.userName }});
    if(user){
      const totalJobCost = (jobData.workersNeed-(jobData.taskDone-jobData.taskCancel))*jobData.taskCost;
      ///User Update
      await user.update({
        notify: true,
        reserved: parseFloat(user.reserved)+parseFloat(totalJobCost),
      });
     //////Notify add
     await Notify.create({
      seen: true,
      message: req.body.reasion,
      path: '/my-jobs',
      userName: jobData.userName
     });
    /////Deposit pay cancel update
    await jobData.update({
      status: "cancel",
    });
    const jobDatas = await Job.findAll();
    res.status(200).json(jobDatas);
  }
  else{
    res.status(500).send('Internal server error');
}
}
  else{
      res.status(500).send('Internal server error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});

  ////Bank remove
router.post('/remove', async(req, res)=>{
    try {
        const depositPayData = await DepositPay.findOne({ where: { id: req.body.id }});
        if(depositPayData){
      await depositPayData.destroy();
      const DepositPayDatas = await DepositPay.findAll();
      res.status(200).json(DepositPayDatas);
    }
    else{
        res.status(500).send('Internal server error');
    }
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });

////Job Request all For Admin
router.post('/', adminCheck, async(req, res)=>{
    try {
      if(req.admin){
      const JobData = await Job.findAll({
        include: {
          model: User, 
          attributes: ['firstName', 'lastName', 'userName', 'email', 'avatar'],
        }
      });
      res.status(200).json(JobData);
    }
    else{
      res.status(500).send('Internal server error');
    }
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });


  ////Job Request all by Employer
router.post('/user-jobs', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){ 
    const JobData = await Job.findAll({ where: { userName: req.userData?.userName }});
    res.status(200).json(JobData);
  }
  else{
    res.status(500).send('Internal server error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});




////////////=============Job For Worker================//////////
router.post('/worker-jobs', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){ 
    const completedTasks = await Task.findAll({ where: { userName: req.userData?.userName }});
    const completedTaskIds = completedTasks.map(task => task.jobID);

    // Find tasks that are not completed by this user
    const JobData = await Job.findAll({ where: {id: {[Sequelize.Op.notIn]: completedTaskIds}, status: "approved" }});
    res.status(200).json(JobData);
    
  }
  else{
    res.status(500).send('Internal server error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});


  ////Job Request Single by Task Submit page Worker
  router.post('/single-job', authCheck, async (req, res) => {
    try {
      if (req.userData?.userName) {
        const completedTasks = await Task.findAll({ where: { userName: req.userData.userName } });
        const completedTaskIds = completedTasks.map(task => task.jobID);
  
        if (completedTaskIds.includes(parseFloat(req.body.jobID))) {
          res.status(400).json('Already Done');
        } else {
          // Find tasks that are not completed by this user
          const jobData = await Job.findOne({ where: { id: req.body.jobID, status: "approved" } });
           if(jobData){
            res.status(200).json(jobData);
           }
           else{
            res.status(500).send('Internal server error');
              }
        }
      } else {
        res.status(500).send('Internal server error');
      }
    } catch (error) {
      console.error('Failed to retrieve job data:', error);
      res.status(500).send('Internal server error');
    }
  });
  

//Export
module.exports = router;