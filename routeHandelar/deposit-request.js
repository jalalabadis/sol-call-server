const express = require('express');
const router = express.Router();
const path = require('path');
const DepositRequest = require('../models/DepositRequest');
const User = require('../models/User');
const Notify = require('../models/Notify');
const AdminNotify = require('../models/AdminNotify');
const Admin = require('../models/Admin');
const authCheck = require('../middlewares/authCheck');




////Bank add
router.post('/add', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){
      if(req.body.amount>=1){
    await DepositRequest.create({
        methodName: req.body.methodName,
        receiverAddress:req.body.receiverAddress,
        senderAddress: req.body.senderAddress,
        amount: req.body.amount,
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
      message:  `New deposit request by ${req.body.methodName} send ${req.userData?.userName}`,
      path: '/deposit-request',
     });

    res.status(200).json("Sucess");
  }
  else{
    res.status(500).send('Minimum deposit $1');
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
      const depositRequestData = await DepositRequest.findOne({ where: { id: req.body.id }});
        if(depositRequestData){
      const user = await User.findOne({ where: { userName: depositRequestData.userName }});
      if(user){
        await user.update({
          reserved:  parseFloat(user.reserved)+ parseFloat(depositRequestData.amount),
        });


      //////affiliate commission sent
      if(user.referral){
        const referralUser = await User.findOne({ where: { userName: user.referral }});
         if(referralUser){
          const commission = depositRequestData.amount*0.05;
          await referralUser.update({
            reward:  parseFloat(referralUser.reward)+ parseFloat(commission),
          });
         }
      };


      /////Deposit pay approve update
      await depositRequestData.update({
        status: "approved",
      });
      const DepositRequestDatas = await DepositRequest.findAll();
      res.status(200).json(DepositRequestDatas);
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
    const depositRequestData = await DepositRequest.findOne({ where: { id: req.body.id }});
      if(depositRequestData){
    const user = await User.findOne({ where: { userName: depositRequestData.userName }});
    if(user){
      ///User Update
      await user.update({
        notify: true,
      });
     //////Notify add
     await Notify.create({
      seen: true,
      message: req.body.reasion,
      path: '/deposit',
      userName: depositRequestData.userName
     });
    /////Deposit pay cancel update
    await depositRequestData.update({
      status: "cancel",
    });
    const DepositRequestDatas = await DepositRequest.findAll();
    res.status(200).json(DepositRequestDatas);
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

////Deposit Balance TransFer
router.post('/move-amount', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){
    const user = await User.findOne({ where: { userName: req.userData?.userName }});
    if(user){
      if(user.earned>=req.body.moveAmount){
        ///////
      await user.update({
        earned: user.earned-req.body.moveAmount,
        reserved:  parseFloat(user.reserved)+ parseFloat(req.body.moveAmount),
      });
    res.status(200).json(user);
  }
  else{
    res.status(500).send('Your Earned Balance to low');
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

////Deposit Request all
router.post('/', async(req, res)=>{
    try {
      const DepositRequestData = await DepositRequest.findAll({
        include: {
          model: User, 
          attributes: ['firstName', 'lastName', 'userName', 'email', 'avatar'], // Specify which user attributes to include
        }
      });
      DepositRequestData.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
      res.status(200).json(DepositRequestData);
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });


  ////Deposit Request all by user
router.post('/user-transactions', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){ 
    const DepositRequestData = await DepositRequest.findAll({ where: { userName: req.userData?.userName }});
    DepositRequestData.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(DepositRequestData);
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