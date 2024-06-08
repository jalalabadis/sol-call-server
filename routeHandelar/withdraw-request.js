const express = require('express');
const router = express.Router();
const path = require('path');
const WithdrawRequest = require('../models/WithdrawRequest');
const User = require('../models/User');
const Notify = require('../models/Notify');
const authCheck = require('../middlewares/authCheck');
const AdminNotify = require('../models/AdminNotify');
const Admin = require('../models/Admin');




////Bank add
router.post('/add', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){
      const user = await User.findOne({ where: { userName: req.userData?.userName}});
      if(user&&req.body.withdrawAmount>=5&&req.body.withdrawAmount<=user.earned){
    await user.update({
      earned:  user.earned-req.body.withdrawAmount,
        });

    await WithdrawRequest.create({
        methodName: req.body.methodName,
        senderAddress: req.body.senderAddress,
        amount: req.body.withdrawAmount,
        status: "pending",
        userName: req.userData?.userName,
    });

     //////Admin Notify add
     await Admin.update(
      { notify: true },
      { where: { notify: false } }
    );    
     await AdminNotify.create({
      seen: true,
      message:  `New withdraw request by ${req.body.methodName} send ${req.userData?.userName}`,
      path: '/withdraw-request',
     });

    
    res.status(200).json("Success");
  }
  else{
    res.status(500).send('Amount error');
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


////Bank approve
router.post('/approve', async(req, res)=>{
    try {
      const withdrawRequestData = await WithdrawRequest.findOne({ where: { id: req.body.id }});
        if(withdrawRequestData){
      const user = await User.findOne({ where: { userName: withdrawRequestData.userName }});
      if(user){
         ///User Update
      await user.update({
        notify: true,
      });
     //////Notify add
     await Notify.create({
      seen: true,
      message: "Your Payment Is Pay your Address",
      path: '/withdrawal',
      userName: withdrawRequestData.userName
     });

      /////Deposit pay approve update
      await withdrawRequestData.update({
        status: "approved",
      });
      const WithdrawRequestDatas = await WithdrawRequest.findAll();
      res.status(200).json(WithdrawRequestDatas);
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


////Bank Cancel
router.post('/cancel', async(req, res)=>{
  try {
    const withdrawRequestData = await WithdrawRequest.findOne({ where: { id: req.body.id }});
      if(withdrawRequestData){
    const user = await User.findOne({ where: { userName: withdrawRequestData.userName }});
    if(user){
      ///User Update
      await user.update({
        earned: parseFloat(user.earned)+parseFloat(withdrawRequestData.amount),
        notify: true,
      });
     //////Notify add
     await Notify.create({
      seen: true,
      message: req.body.reasion,
      path: '/withdrawal',
      userName: withdrawRequestData.userName
     });
    /////Deposit pay cancel update
    await withdrawRequestData.update({
      status: "cancel",
    });
    const WithdrawRequestDatas = await WithdrawRequest.findAll();
    res.status(200).json(WithdrawRequestDatas);
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

////Deposit Request all
router.post('/', async(req, res)=>{
    try {
      const WithdrawRequestData = await WithdrawRequest.findAll({
        include: {
          model: User, 
          attributes: ['firstName', 'lastName', 'userName', 'email', 'avatar'], // Specify which user attributes to include
        }
      });
      res.status(200).json(WithdrawRequestData);
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });


  ////Deposit Request all by user
router.post('/user-transactions', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){ 
    const WithdrawRequestData = await WithdrawRequest.findAll({ where: { userName: req.userData?.userName }});
    res.status(200).json(WithdrawRequestData);
  }
  else{
    res.status(500).send('Internal server error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});

//Export
module.exports = router;