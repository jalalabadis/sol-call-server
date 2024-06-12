const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const TemporaryUser = require('../models/TemporaryUser');
const authCheck = require('../middlewares/authCheck');
const emailSend = require('../middlewares/emailSend');
const generateRandomCode = require('../middlewares/generateVerifyCode');
const checkValidEmail = require('../middlewares/checkValidEmail');
const passwordhashing = require('../middlewares/passwordhashing');
const bcrypt = require('bcrypt');
const sendConfirmationEmail = require('../middlewares/emailSend');
const generateSecretKey = require('../middlewares/generateSecretKey');
const Notify = require('../models/Notify');


////All notify
router.post('/', authCheck, async(req, res)=>{
if(req.userData?.userName){ 
  try {
    const notifyData = await Notify.findAll({ where: { userName: req.userData?.userName }});

    if (!notifyData) {
      return res.status(404).send('User not found');
    }
    notifyData.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(notifyData);
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
    }
    else{
        res.status(500).send('Authorization failed!');
    }
});


////User mark
router.post('/mark', authCheck, async(req, res)=>{
  if(req.userData?.userName){ 
    try {
      const user = await User.findOne({ where: { userName: req.userData?.userName }});
  
      if (!user) {
        return res.status(404).send('User not found');
      }
  
      await user.update({
        notify: false,
      });
      res.status(200).json(user);
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