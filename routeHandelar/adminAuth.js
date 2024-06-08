const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Admin = require('../models/Admin');
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
const AdminNotify = require('../models/AdminNotify');



//////Admin default set
router.post('/', async (req, res)=>{
  try{
  const admin = await Admin.findAll();
  if(admin.length<=0){
    const passwords = await passwordhashing('tttt');
     //////Admin default add
     await Admin.create({
      userName: "leadcbqt",
      password: passwords,
      notify: false,
      support: false
     });

     res.status(200).json('Success');
  }

  else{
    res.status(200).json('Success');
  }
}
catch (err) {
  console.log(err);
  res.status(500).send('Internal Server Error');
}
});
 

//////Login User
router.post('/login', async (req, res) => {
  try {
    const admin = await Admin.findOne({ where: { userName: req.body.username }});
    if (!admin) {
      res.status(200).json({Status: false, Message:"User not found"});
      return;
    }
const enteredPassword = req.body.password;
const isPasswordValid = await bcrypt.compare(enteredPassword, admin.password);

if (isPasswordValid) {
const adminDataObject = {userName:admin.userName};
 const token = jwt.sign(adminDataObject, process.env.JWT_SECRET, { expiresIn: '7d' });
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

//////////////////////////////////////////////////////////////////
router.post('/notify', adminCheck, async (req, res)=>{
  try{
    if(req.admin){
      const adminNotify = await AdminNotify.findAll();
       adminNotify.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
      res.status(200).json(adminNotify);
    }
    else{
      res.status(500).send('Authorization failed!');
    }
  }
  catch{
    res.status(500).send('Authorization failed!');
  }
  });


  ////Admin notify mark
router.post('/mark', adminCheck, async(req, res)=>{
  if(req.admin){ 
    try {
      const admin = await Admin.findOne({ where: { userName: req.admin?.userName }});
  
      if (!admin) {
        return res.status(404).send('User not found');
      }
  
      await admin.update({
        notify: false,
      });
      res.status(200).json(admin);
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