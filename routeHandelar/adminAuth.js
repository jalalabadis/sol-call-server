const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const TemporaryUser = require('../models/TemporaryUser');
const authCheck = require('../middlewares/authCheck');
const generateRandomCode = require('../middlewares/generateVerifyCode');
const checkValidEmail = require('../middlewares/checkValidEmail');
const passwordhashing = require('../middlewares/passwordhashing');
const bcrypt = require('bcrypt');
const sendConfirmationEmail = require('../middlewares/emailSend');
const generateSecretKey = require('../middlewares/generateSecretKey');
const sendResetCodeEmail = require('../middlewares/emailSend');
const adminCheck = require('../middlewares/adminCheck');




 

//////Login User
router.post('/login', async (req, res) => {
  try {
    if (req.body.username==="leadcbqt"&&req.body.password==="tttt") {
      const userDataObject ={
user: 'leadcbqt',
rules: 'admin'
      };
 const token = jwt.sign(userDataObject, process.env.JWT_SECRET, { expiresIn: '7d' });
 res.status(200).json({Status: true, token });
    }

   else {
      res.status(200).json({Status: false, Message:"Incorrect password"});
    }
  } catch (err) {
    console.log(err);
    res.status(200).json({Status: false, Message:'Internal Server Error'});
  }
});



  /////Auth check
  router.post('/check', adminCheck, async (req, res)=>{

    try{
      if(req.admin){
        res.status(200).json(req.admin);
      }
      else{
        res.status(500).send('Authorization failed!');
      }
    }
    catch{
      res.status(500).send('Authorization failed!');
    }
    });



//Export
module.exports = router;