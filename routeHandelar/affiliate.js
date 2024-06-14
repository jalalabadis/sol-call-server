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
    where: { userName: referral.userName, status: 'approved' }
  });

  const withdrawSum = await WithdrawRequest.sum('amount', {
    where: { userName: referral.userName, status: 'approved' }
  });

  const depositProfit = depositSum ? depositSum * 0.05 : 0; // 5% profit from deposits
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




 



////reword-claim
router.post('/reword-claim', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){
      const user = await User.findOne({ where: { userName: req.userData?.userName }});

    if (!user) {
      return res.status(500).send('User Not Found');
    }

    if (user.reward<=5) {
      return res.status(500).send('Minimum Claim $5');
    }

    //////Transaction 
    await DepositRequest.create({
      methodName: "Affiliate Reword",
      receiverAddress:"Affiliate Bunas Auto",
      senderAddress: "Affiliate Reword",
      amount: user.reward,
      status: "approved",
      userName: req.userData?.userName,
  });
  ///User Update
    await user.update({
      reward:  0,
      earned: parseFloat(user.earned)+parseFloat(user.reward),
    });

  
 
res.json(user);

  }
  else{
    res.status(500).send('Server Error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});






  

 

//Export
module.exports = router;