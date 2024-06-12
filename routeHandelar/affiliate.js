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
const Support = require('../models/Support');
const Messages = require('../models/Messages');
const Admin = require('../models/Admin');
const DepositRequest = require('../models/DepositRequest');
const WithdrawRequest = require('../models/WithdrawRequest');




////All affiliate
router.post('/', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){
      const referrals = await User.findAll({ where: { referral: req.userData?.userName }, 
                                 attributes: ['userName', 'email', 'status']});

   
// Initialize the result
const result = [];

for (const referral of referrals) {
  const depositSum = await DepositRequest.sum('amount', {
    where: { userName: referral.userName, status: 'completed' }
  });

  const withdrawSum = await WithdrawRequest.sum('amount', {
    where: { userName: referral.userName, status: 'completed' }
  });

  const depositProfit = depositSum ? depositSum * 0.1 : 0; // 10% profit from deposits
  const withdrawProfit = withdrawSum ? withdrawSum * 0.05 : 0; // 5% profit from withdrawals
  const totalProfit = depositProfit + withdrawProfit;

  result.push({
    email: referral.email,
    status: referral.status,
    depositProfit: depositProfit.toFixed(4),
    withdrawProfit: withdrawProfit.toFixed(4),
    totalProfit: totalProfit.toFixed(4)
  });
}

res.json(result);

  }
  else{
    res.status(500).send('No ref');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});




 










  

 

//Export
module.exports = router;