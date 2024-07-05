const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nacl = require('tweetnacl');
const authCheck = require('../middlewares/authCheck');
const bs58 = require('bs58').default || require('bs58');

// Login User
router.post('/login', async (req, res) => {
  try {
    const {public_key, signature } = req.body;
    const message = 'Authentication request'
    const verified = await nacl.sign.detached.verify(
        new TextEncoder().encode(message),
        bs58.decode(signature),
        bs58.decode(public_key)
      );


    // If signature is valid, proceed with authentication
    if (verified) {
      const user = await User.findOne({ where: { wallet: public_key } });
      if (user) {
        const userDataObject = {wallet: user?.wallet};
        const token = jwt.sign(userDataObject, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({Status: true, token });
      } else {
        const newUser = await User.create({
          wallet: public_key,
          type: 'player',
          status: 'active',
          last_play: new Date(),
          earned: 0
        });
        const userDataObject = {wallet: newUser?.wallet};
        const token = jwt.sign(userDataObject, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(200).json({Status: true, token });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid signature' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

  /////Auth check
  router.post('/check', authCheck, async (req, res)=>{
    try{
      
      if(req.userData&&req.userData?.status === "active"){
        //console.log(req.userData)
        res.status(200).json(req.userData);
      }
      else{
        res.status(500).send('Authorization failed!');
      }
    }
    catch{
      res.status(500).send('Server Error');
    }
    });

// Export router
module.exports = router;
