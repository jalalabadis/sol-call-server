const express = require('express');
const router = express.Router();
const WithdrawRequest = require('../models/WithdrawRequest');
const User = require('../models/User');
const authCheck = require('../middlewares/authCheck');
const getGoodManAmount = require('../middlewares/getGoodManAmount');




////Bank add
router.post('/add', authCheck, async(req, res)=>{
  try {
    if(req.userData){
      const user = await User.findOne({ where: { wallet: req.userData.wallet }});
      if(user){
    await user.update({
      earned:  0,
        });

    await WithdrawRequest.create({
        wallet: user.wallet,
        amount: user.earned,
        status: "pending",
    });
    const userResponse = user.toJSON();
        const goodman = await getGoodManAmount(req.userData.wallet);
        userResponse.goodman = Number(goodman);
    res.status(200).json({status: true, user: userResponse, amount: req.userData.earned});
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


////Bank approve by Admin
router.post('/approve', async(req, res)=>{
    try {
      const withdrawRequestData = await WithdrawRequest.findOne({ where: { id: req.body.id }});
        if(withdrawRequestData){
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
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });


////Bank Cancel by Admin
router.post('/cancel', async(req, res)=>{
  try {
    const withdrawRequestData = await WithdrawRequest.findOne({ where: { id: req.body.id }});
      if(withdrawRequestData){
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
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});

  ////Withdraw remove
  router.post('/remove', async(req, res)=>{
    try {
        const withdrawRequestData = await WithdrawRequest.findOne({ where: { id: req.body.id }});
        if(withdrawRequestData){
      await withdrawRequestData.destroy();
      const WithdrawRequestDatas = await WithdrawRequest.findAll();
      res.status(200).json(WithdrawRequestDatas);
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
          attributes: ['wallet', 'last_play'], // Specify which user attributes to include
        }
      });
      WithdrawRequestData.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
      res.status(200).json(WithdrawRequestData);
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });



//Export
module.exports = router;