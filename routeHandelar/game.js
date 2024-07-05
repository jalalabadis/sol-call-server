const express = require('express');
const router = express.Router();
const authCheck = require('../middlewares/authCheck');
const Admin = require('../models/Admin');
const User = require('../models/User');
const getGoodManAmount = require('../middlewares/getGoodManAmount');



////Profile Status
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
          last_play: new Date()
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

//Export
module.exports = router;