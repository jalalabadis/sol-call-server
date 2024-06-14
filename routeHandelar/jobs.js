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
const Admin = require('../models/Admin');
const AdminNotify = require('../models/AdminNotify');




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
     await Admin.update(
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

////Job Edit
router.post('/edit', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){
      const jobData = await Job.findOne({ where: { id: req.body.id }});
      const user = await User.findOne({ where: { userName: req.userData?.userName }});
      if(user&&jobData){
        if(jobData.workersNeed<=req.body.workersNeed){
        const remindJobCost = (jobData.workersNeed-(jobData.taskDone-jobData.taskCancel))*jobData.taskCost;
        const newJobCost = (req.body.workersNeed*req.body.taskCost)+(req.body.promoteJob?1:0);
        const totalJobCost = newJobCost-remindJobCost;
       
        if (totalJobCost>user.reserved) {
          res.status(500).json("Amount not found");
          return;
        }
      await user.update({
        reserved: user.reserved-totalJobCost,
      });
    await jobData.update({
    targetZone: req.body.targetZone, 
    excludeCountry:req.body.excludeCountry,
    category:req.body.selectedCategory, 
    subCategory:req.body.selectedSubCategory, 
    workersNeed:req.body.workersNeed, 
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
    });

     //////Admin Notify add
     await Admin.update(
      { notify: true },
      { where: { notify: false } }
    );    
     await AdminNotify.create({
      seen: true,
      message:  `Edit Job request by ${req.body.id} send ${req.userData?.userName}`,
      path: '/jobs',
     });

    res.status(200).json("Success");
  }
  else{
    res.status(500).send(`Minimum workersNeed Incrase 1`);
  }
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


/////increase-worker
router.post('/increase-worker', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){
      const jobData = await Job.findOne({ where: { id: req.body.id }});
      const user = await User.findOne({ where: { userName: req.userData?.userName }});
      if(user&&jobData){
        const totalJobCost =req.body.workersNeed*jobData.taskCost;
        if (req.body.workersNeed<=0) {
          res.status(500).json("minimum increase 1");
          return;
        }
        if (totalJobCost>user.reserved) {
          res.status(500).json("Amount not found");
          return;
        }
      await user.update({
        reserved: user.reserved-totalJobCost,
      });
    await jobData.update({
    workersNeed: parseFloat(jobData.workersNeed)+parseFloat(req.body.workersNeed),
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


////Job approve by admin
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


////Job Cancel by admin
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

////Job Stop Admin
router.post('/stop-admin', async(req, res)=>{
  try {
    const jobData = await Job.findOne({ where: { id: req.body.id }});
      if(jobData){
    const user = await User.findOne({ where: { userName: jobData.userName }});
    if(user){
      ///User Update
      await user.update({
        notify: true,
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
      status: "stop-admin",
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
      JobData.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
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

////Job Stop by Employer
router.post('/stop', authCheck, async(req, res)=>{
  try {
if(req.userData?.userName){ 
    const jobData = await Job.findOne({ where: { id: req.body.id }});
      if(jobData){
    /////Deposit pay cancel update
    await jobData.update({
      status: "stop",
    });
    const JobData = await Job.findOne({ where: { id: req.body.id }});
    const TaskData = await Task.findAll({ where: { jobID: req.body.id, status: { [Op.ne]: 'hide'}}});
   res.status(200).json({JobData, TaskData});
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

////Job approved Run by Employer
router.post('/run', authCheck, async(req, res)=>{
  try {
if(req.userData?.userName){ 
    const jobData = await Job.findOne({ where: { id: req.body.id }});
      if(jobData&&jobData.status==="stop"){
    /////Deposit pay cancel update
    await jobData.update({
      status: "approved",
    });
    const JobData = await Job.findOne({ where: { id: req.body.id }});
    const TaskData = await Task.findAll({ where: { jobID: req.body.id, status: { [Op.ne]: 'hide'} }});
   res.status(200).json({JobData, TaskData});
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




////////////=============Job For Worker================//////////
 ////////////////////Single Gob Data send By Edit
 router.post('/single-job-edit', authCheck, async (req, res) => {
  try {
    if (req.userData?.userName) {
        // Find tasks that are not completed by this user
        const jobData = await Job.findOne({ where: { id: req.body.jobID, userName: req.userData?.userName, status: "approved" } });
         if(jobData){
          res.status(200).json(jobData);
         }
         else{
          res.status(500).send('Internal server error');
            }
      }
  } catch (error) {
    console.error('Failed to retrieve job data:', error);
    res.status(500).send('Internal server error');
  }
});

//Export
module.exports = router;