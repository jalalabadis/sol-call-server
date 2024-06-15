const express = require('express');
const router = express.Router();
const CryptoJS =  require('crypto-js');
const path = require('path');
const multer  = require('multer');
const Job = require('../models/Job');
const User = require('../models/User');
const Notify = require('../models/Notify');
const authCheck = require('../middlewares/authCheck');
const Task = require('../models/Task');
const adminCheck = require('../middlewares/adminCheck');
const { Sequelize, Op, DataTypes } = require('sequelize');


// Set storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = file.originalname
      .replace(fileExt, "")
      .toLowerCase()
      .split(" ")
      .join("-") + "-" + Date.now();
    cb(null, fileName + fileExt);
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

// Set upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: fileFilter
});

////New Task Submit For Worker
router.post('/add', upload.fields([{ name: 'proof1' }, { name: 'proof2' }, 
  { name: 'proof3' }, { name: 'proof4' }]), authCheck, async (req, res) => {
  try {
    const { userName } = req.userData || {};
    if (!userName) {
      return res.status(500).send('User Not Found');
    }

    const user = await User.findOne({ where: { userName } });
    const job = await Job.findOne({ where: { id: req.body.jobID, status: "approved" } });

    if (!user || !job || (job.taskDone - job.taskCancel) > job.workersNeed) {
      return res.status(500).send('Job Not found');
    }

    if (job.workersNeed <= (job.taskDone - job.taskCancel)) {
      return res.status(500).send('Job Not available at the moment');
    }

    const completedTasks = await Task.findAll({ where: { userName } });
    const completedTaskIds = completedTasks.map(task => task.jobID);

    if (completedTaskIds.includes(parseFloat(req.body.jobID))) {
      return res.status(400).send('Already Done');
    }

    const jobRemind = job.workersNeed - (job.taskDone - job.taskCancel);
    let taskStatus = 'pending';

    if (["system_verify", "system_rate"].includes(job.ratingType)) {
      const employer = await User.findOne({ where: { userName: job.userName } });
      const hash = CryptoJS.SHA256(job.id+user.id+employer.SecretKey);
      const vcode = 'lw-' + hash.toString(CryptoJS.enc.Hex);

      if (req.body.proof1 !== vcode) {
        return res.status(500).send('Invalid Vcode');
      }

      const updatedField = job.ratingType === "system_verify" ? 'pending' : 'earned';
      await user.update({
        [updatedField]: parseFloat(user[updatedField]) + parseFloat(job.taskCost),
        tasksDone: user.tasksDone + 1
      });

      taskStatus = job.ratingType === "system_rate" ? 'approved' : 'pending';
    } else {
      await user.update({
        pending: parseFloat(user.pending) + parseFloat(job.taskCost),
        tasksDone: user.tasksDone + 1
      });
    }

    await job.update({
      taskDone: job.taskDone + 1,
      status: jobRemind <= 1 ? "completed" : job.status
    });

    await Task.create({
      proof1: req.files.proof1 ? req.files.proof1[0].filename : req.body.proof1,
      proof2: req.files.proof2 ? req.files.proof2[0].filename : req.body.proof2,
      proof3: req.files.proof3 ? req.files.proof3[0].filename : req.body.proof3,
      proof4: req.files.proof4 ? req.files.proof4[0].filename : req.body.proof4,
      status: taskStatus,
      jobID: req.body.jobID,
      ip: user.ip,
      country: user.country,
      userName
    });

    res.status(200).json("Success");
  } catch (error) {
    console.error('Failed to process task submission:', error);
    res.status(500).send('Internal server error');
  }
});


////Hide Task Submit For Worker
router.post('/job-hide',  authCheck, async(req, res)=>{
try {
if(req.userData?.userName){
const user = await User.findOne({ where: { userName: req.userData?.userName }});
const job = await Job.findOne({ where: { id: req.body.jobID, status: "approved"}});
const completedTasks = await Task.findAll({ where: { userName: req.userData.userName } });
const completedTaskIds = completedTasks.map(task => task.jobID);
if(completedTaskIds.includes(parseFloat(req.body.jobID))) {
res.status(400).json({ status: false, message: 'Already Done' });
}
else if(!user&&!job&&((job.taskDone-job.taskCancel)>job.workersNeed)){
res.status(500).send('Job Not found');
}
else if(job.workersNeed<=(job.taskDone-job.taskCancel)){
res.status(500).send('Job Already Complete');
}
else{

await Task.create({
proof1: 'hide', 
proof2:'', 
proof3:'', 
proof4:'', 
status: 'hide',
jobID: req.body.jobID,
ip: user.ip,
country: user.country,
userName: req.userData?.userName

});
res.status(200).json("Success");
}
}
else{
res.status(500).send('User Not Found');
}
} catch (error) {
console.error('Failed to retrieve last seen timestamp:', error);
res.status(500).send('Internal server error');
}
});

////Task approve for Employer
router.post('/approve', authCheck, async(req, res)=>{
    try {
      if(req.userData?.userName){
      const taskData = await Task.findOne({ where: { id: req.body.taskID, status: 'pending' }});
        if(taskData){
      const user = await User.findOne({ where: { userName: taskData.userName }});
      const job = await Job.findOne({ where: { id: taskData.jobID }});
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
      await taskData.update({
        status: 'approved',
      });
      const JobData = await Job.findOne({ where: { id: taskData.jobID }});
     const TaskData = await Task.findAll({ where: { jobID: taskData.jobID }});
    res.status(200).json({JobData, TaskData});
    }
    else{
      res.status(500).send('Internal server error');
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


  ////Task Approve multiple for Employer
router.post('/approve-many', authCheck, async (req, res) => {
  try {
      if (req.userData?.userName) {
          const taskIDs = req.body.selectedTasks;
          const tasks = await Task.findAll({ where: { id: taskIDs, status: 'pending' } });

          if (tasks && tasks.length > 0) {
              for (let taskData of tasks) {
                  const user = await User.findOne({ where: { userName: taskData.userName } });
                  const job = await Job.findOne({ where: { id: taskData.jobID } });

                  if (user && job) {
                      await user.update({
                          earned: parseFloat(user.earned) + parseFloat(job.taskCost),
                          pending: parseFloat(user.pending) - parseFloat(job.taskCost),
                          totalEarned: parseFloat(user.totalEarned) + parseFloat(job.taskCost),
                          satisfied: user.satisfied + 1,
                      });

                      // Job update
                      await job.update({
                          taskPay: job.taskPay + 1,
                      });

                      // Task update
                      await taskData.update({
                          status: 'approved',
                      });
                  } else {
                      return res.status(500).send('Internal server error: User or Job not found');
                  }
              }

              const jobID = tasks[0].jobID;
              const JobData = await Job.findOne({ where: { id: jobID } });
              const TaskData = await Task.findAll({ where: { jobID } });

              res.status(200).json({ JobData, TaskData });
          } else {
              res.status(404).send('Tasks not found');
          }
      } else {
          res.status(401).send('Unauthorized');
      }
  } catch (error) {
      console.error('Failed to approve tasks:', error);
      res.status(500).send('Internal server error');
  }
});


////Task Cancel for employer
router.post('/cancel', async(req, res)=>{
  try {
    const taskData = await Task.findOne({ where: { id: req.body.taskID }});
      if(taskData){
    const user = await User.findOne({ where: { userName: taskData.userName }});
    const job = await Job.findOne({ where: { id: taskData.jobID }});
    if(user&&job){
      await user.update({
        pending: Math.max(0, parseFloat(user.earned) - parseFloat(job.taskCost)),
        notSatisfied: user.notSatisfied+1,
      });

    /////Job update
    await job.update({
      taskCancel: job.taskCancel+1,
    });
    /////Task Update
    await taskData.update({
      status: 'cancel',
      reason: req.body.reason
    });
    const JobData = await Job.findOne({ where: { id: taskData.jobID }});
   const TaskData = await Task.findAll({ where: { jobID: taskData.jobID }});
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


////Task revise for employer
router.post('/revise', async(req, res)=>{
  try {
    const taskData = await Task.findOne({ where: { id: req.body.taskID }});
      if(taskData){
    const user = await User.findOne({ where: { userName: taskData.userName }});
    const job = await Job.findOne({ where: { id: taskData.jobID }});
    if(user&&job){

      /////
      ///User Update
      await user.update({
        notify: true,
      });
     //////Notify add
     await Notify.create({
      seen: true,
      message: "The employer has requested that you revise a job",
      path: '/completed-tasks',
      userName: taskData.userName
     });
    /////Task Update
    await taskData.update({
      status: 'revise',
      reason: req.body.reason
    });
    const JobData = await Job.findOne({ where: { id: taskData.jobID }});
   const TaskData = await Task.findAll({ where: { jobID: taskData.jobID }});
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


////Deposit Request all
// router.post('/', async(req, res)=>{
//     try {
//       const JobData = await Job.findAll({
//         include: {
//           model: User, 
//           attributes: ['firstName', 'lastName', 'userName', 'email', 'avatar'], 
//         }
//       });
//       res.status(200).json(JobData);
//     } catch (error) {
//       console.error('Failed to retrieve last seen timestamp:', error);
//       res.status(500).send('Internal server error');
//     }
//   });


  ////Worker all Complete Task for worker
router.post('/worker-complete-task', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){ 
    const taskData = await Task.findAll(
      { where: { 
        userName: req.userData?.userName, 
        status: { [Op.ne]: 'hide'} 
    },
      include: {
        model: Job, 
        attributes: ['targetZone', 'excludeCountry', 'category', 'subCategory', 
        'workersNeed', 'taskDone', 'taskPay', 'taskCancel', 'taskCost', 'ttr',
         'jobTitle', 'jobRequirement', 'proof1', 'proof2', 'proof3', 'proof4',
         'proof1Type', 'proof2Type', 'proof3Type', 'proof4Type',
          'userName']
      }});
    res.status(200).json(taskData);
  }
  else{
    res.status(500).send('Internal server error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});




////////////=============Job by Complete Task For Employer================//////////
router.post('/job-complete-task', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){ 
    const JobData = await Job.findOne({ where: { id: req.body.jobID }});
     const TaskData = await Task.findAll({ where: { jobID: req.body.jobID, status: { [Op.ne]: 'hide'}  }});
    res.status(200).json({JobData, TaskData});
  }
  else{
    res.status(500).send('Internal server error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});


////////////=============Job by Complete Task For Admin================//////////
router.post('/job-complete-task-admin', adminCheck, async(req, res)=>{
  try {
    if(req.admin){ 
    const JobData = await Job.findOne({ where: { id: req.body.jobID }});
     const TaskData = await Task.findAll({ where: { jobID: req.body.jobID, status: { [Op.ne]: 'hide'} }, include: {
      model: User, 
      attributes: ['firstName', 'lastName', 'userName', 'email', 'avatar'],
    }});
    res.status(200).json({JobData, TaskData});
  }
  else{
    res.status(500).send('Internal server error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});


  //========================================\\
 //          Revise                          \\
//============================================\\


////Revise job data send single page for Worker
router.post('/revise-job', authCheck, async (req, res) => {
  try {
    if (req.userData?.userName) {
      const tasks = await Task.findOne({ where: { id: req.body.taskID }, 
        include: {
          model: Job, 
          attributes: ['targetZone', 'excludeCountry', 'category', 'subCategory', 
          'workersNeed', 'taskDone', 'taskPay', 'taskCancel', 'taskCost', 'ttr',
           'jobTitle', 'jobRequirement', 'proof1', 'proof2', 'proof3', 'proof4',
           'proof1Type', 'proof2Type', 'proof3Type', 'proof4Type',
            'userName']
        }});
      if (tasks) {
        res.status(200).json(tasks);
      }
     else {
      res.status(400).json('Already Done');
    }
    } else {
      res.status(500).send('Internal server error');
    }
  } catch (error) {
    console.error('Failed to retrieve job data:', error);
    res.status(500).send('Internal server error');
  }
});


////Revise job Task Submit for Worker
router.post('/revise-submit',  upload.fields([{ name: 'proof1' }, { name: 'proof2' }, 
{ name: 'proof3' }, { name: 'proof4' }]), authCheck, async (req, res) => {
  try {
    if (req.userData?.userName) {
      const tasks = await Task.findOne({ where: { id: req.body.taskID}});
      if (tasks&&(tasks.userName===req.userData?.userName)&&tasks.status==="revise") {
        await tasks.update({
      proof1: req.files.proof1?req.files.proof1[0].filename:req.body.proof1, 
      proof2:req.files.proof2?req.files.proof2[0].filename:req.body.proof2, 
      proof3:req.files.proof3?req.files.proof3[0].filename:req.body.proof3, 
      proof4:req.files.proof4?req.files.proof4[0].filename:req.body.proof4, 
      status: 'pending',
      ip: req.userData?.ip,
      country: req.userData?.country
        });
        res.status(200).json("Success");
      }
     else {
      res.status(400).json('Already Done');
    }
    } else {
      res.status(500).send('Internal server error');
    }
  } catch (error) {
    console.error('Failed to retrieve job data:', error);
    res.status(500).send('Internal server error');
  }
});


 ////Task revise remove for Worker
 router.post('/revise-remove', authCheck, async(req, res)=>{
  try {
    if (req.userData?.userName) {
      const tasks = await Task.findOne({ where: { id: req.body.taskID}});
      if (tasks&&(tasks.userName===req.userData?.userName)&&tasks.status==="revise") {
        const user = await User.findOne({ where: { userName: tasks.userName }});
        const job = await Job.findOne({ where: { id: tasks.jobID }});
        if(user&&job){
          await user.update({
            pending: parseFloat(user.pending)-parseFloat(job.taskCost),
            tasksDone: user.tasksDone-1
          });
          await job.update({
            taskDone: job.taskDone-1
          });
          await tasks.destroy();
          const taskData = await Task.findAll(
            { where: { userName: req.userData?.userName },
            include: {
              model: Job, 
              attributes: ['targetZone', 'excludeCountry', 'category', 'subCategory', 
              'workersNeed', 'taskDone', 'taskPay', 'taskCancel', 'taskCost', 'ttr',
               'jobTitle', 'jobRequirement', 'proof1', 'proof2', 'proof3', 'proof4',
               'proof1Type', 'proof2Type', 'proof3Type', 'proof4Type',
                'userName']
            }});
          res.status(200).json(taskData);
        }
        else{
          res.status(500).send('Access server error');
        }
      }
     else {
      res.status(400).json('Already Done');
    }
    } else {
      res.status(500).send('Internal server error');
    }
      
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});

//Export
module.exports = router;