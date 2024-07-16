const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authCheck = require('../middlewares/authCheck');
const Admin = require('../models/Admin');
const User = require('../models/User');
const getGoodManAmount = require('../middlewares/getGoodManAmount');


  // Rate limiter configuration
  const timeAddLimiter = rateLimit({
    windowMs: 5 * 1000, // 5 seconds
    max: 3, // limit each IP to 1 request per windowMs
    message: 'Too many requests, please try again later.',
    handler: (req, res, next, options) => {
      res.status(options.statusCode).json({ status: false, message: options.message });
    },
  });


////Game Play
router.post('/', authCheck, async(req, res)=>{
    if(req.userData&&req.userData?.status === "active"){
  try {
    const admin = await Admin.findOne();
    const user = await User.findOne({ where: { wallet: req.userData.wallet }});
    const goodman = await getGoodManAmount(req.userData.wallet);
    if(admin&&user&&goodman>100000){
      const winProbability = admin.percentage;
      const tokenMin = admin.minimum;
      const tokenMax = admin.maximum;
     
      const isWinner = Math.random() * 100 < winProbability;
      if (isWinner) {
        const tokenAmount = Math.floor(Math.random() * (tokenMax - tokenMin + 1)) + tokenMin;
        await user.update({
          earned: parseFloat(user.earned)+parseFloat(tokenAmount),
          last_play: null
        });

        const userResponse = user.toJSON();
        userResponse.goodman = Number(goodman);
        res.status(200).json({status: true, user: userResponse, win: tokenAmount});
      } else {
         res.status(200).json({status: false});
      }
    }
else{
  res.status(500).send('Internal server error');
}
  
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
}
    else{
        res.status(500).send('Authorization failed!');
    }
});


/////Time Left Add
router.post('/time-add', timeAddLimiter, async(req, res)=>{
try {
  const decoted = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const {wallet} = decoted;
    const user = await User.findOne({ where: { wallet: wallet }});
  if(user){
    const randomTime = Math.floor(Math.random() * 10 * 60)+ 1 * 60;
      await user.update({
        last_play: user.last_play?user.last_play:randomTime
      });

      res.status(200).json(user.last_play);
    } else {
       res.status(500).json({status: false});
    }

} catch (error) {
  console.error('Failed to retrieve last seen timestamp:', error);
  res.status(500).send('Internal server error');
}
});

/////Time Left Remove
router.post('/time-remove', timeAddLimiter, async(req, res)=>{
try {
  const decoted = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const {wallet} = decoted;
    const user = await User.findOne({ where: { wallet: wallet }});
  if(user){
      await user.update({
        last_play: null
      });

      res.status(200).json(user);
    } else {
       res.status(500).json({status: false});
    }

} catch (error) {
  console.error('Failed to retrieve last seen timestamp:', error);
  res.status(500).send('Internal server error');
}
});

//Export
module.exports = router;