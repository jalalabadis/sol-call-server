const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Admin = require('../models/Admin');
const passwordhashing = require('../middlewares/passwordhashing');
const bcrypt = require('bcrypt');
const adminCheck = require('../middlewares/adminCheck');
const dotenv = require('dotenv');
dotenv.config();




//////Admin default set
router.post('/', async (req, res)=>{
  try{
  const admin = await Admin.findAll();
  if(admin.length<=0){
    const passwords = await passwordhashing(process.env.ADMIN_PASSWORD);
     //////Admin default add
     await Admin.create({
      userName: "admin",
      password: passwords,
      notify: false,
      support: false,
      percentage: 3,
      minimum: 1000,
      maximum: 10000
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
router.post('/percentage', adminCheck, async (req, res)=>{
  try{
    if(req.admin){
      const admin = await Admin.findOne({ where: { userName: req.admin?.userName }});

    await  admin.update({
        percentage: req.body.percentage
      });

      res.status(200).send('Success');
    }
    else{
      res.status(500).send('Authorization failed!');
    }
  }
  catch(err){
    console.log(err)
    res.status(500).send('Server Error!');
  }
  });


      //////////////////////////////////////////////////////////////////
router.post('/win-range', adminCheck, async (req, res)=>{
  try{
    if(req.admin){
      const admin = await Admin.findOne({ where: { userName: req.admin?.userName }});

    await  admin.update({
        minimum: req.body.minimum,
        maximum: req.body.maximum
      });

      res.status(200).send('Success');
    }
    else{
      res.status(500).send('Authorization failed!');
    }
  }
  catch(err){
    console.log(err)
    res.status(500).send('Server Error!');
  }
  });
//////////////////////////////////////////////////////////////////

//Export
module.exports = router;