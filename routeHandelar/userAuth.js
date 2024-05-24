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





/////Signup New User Data
router.post('/singup', async (req, res)=>{
  try{
const eexistingUserEmail = await User.findOne({ where: { email: req.body.email } });
const existingUserName = await User.findOne({ where: { userName: req.body.userName } });
const pendingUser = await TemporaryUser.findOne({ where: { email:req.body.email} });
const randomCode = generateRandomCode();
const emailformet = checkValidEmail(req.body.email);
const passwords = await passwordhashing(req.body.pass);
const userJsonData = {
  firstName: req.body.firstName,
  lastName: req.body.lastName,
  userName: req.body.userName,
  email: req.body.email,
  password: passwords,
  status: "pending",
  referral: req.body.referral,
  ip: req.body.ip,
  token: randomCode
};

if (eexistingUserEmail) {
      // Email found
      res.send("Email alredy Register");
  } else if (existingUserName) {
      // Username found
      res.send("Username match");
  }
  else if (pendingUser) {
    // Username found
    await sendConfirmationEmail(req.body.email, randomCode);
    res.send("pending confirmation.");
}
  else if (req.body.pass.length<6) {
    // Username found
    res.send("Password To Short");
}
else if (!emailformet) {
  // Username found
  res.send("Invelid Email");
}
  else {
    // Store user data in temporary table
    await TemporaryUser.create(userJsonData);
    // Send confirmation email
   await sendConfirmationEmail(req.body.email, randomCode);
    res.status(200).json({ message: 'Registration successful. Please check your email to confirm your account.' });
  }
  
  }
  catch(err){
    console.log(err)
    res.status(500).send('Authorizatsadf');
  }
  });


//////Login User
router.post('/login', async (req, res) => {
  try {
    const enteredPassword = req.body.password;
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.send("Email not found");
      return;
    }

    const isPasswordValid = await bcrypt.compare(enteredPassword, user.password);

    if (isPasswordValid) {
      if (user.status === "Active") {
        const userDataObject = user.toObject();
        const token = jwt.sign(userDataObject, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ type: user.type, token: token });
      } else {
        res.send("Your account is inactive");
      }
    } else {
      res.send("Incorrect password");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Internal Server Error');
  }
});



  /////Auth check
  router.post('/auth-check', authCheck, async (req, res)=>{
    try{
      if(req.userName){
      res.status(200).json(req.user_decoted_Data);
      }
      else{
        res.status(500).send('Authorization failed!');
      }
    }
    catch{
      res.status(500).send('Authorization failed!');
    }
    });



//////password resat
router.post('/password-reset', emailSend, async (req, res)=>{
  try{
    res.status(200).send(req.emStatus);
  }
  catch(err){
    console.log(err)
    res.status(500).send('Authorizatsadf');
  }
  });


  //////Code verify
router.post('/verify-code', async (req, res)=>{
  try{
    const userJsonData = await User.findOne({ email: req.body.email, VerifyCode:req.body.verifyCode});
        if (userJsonData) {
    res.status(200).json({Status:true});
        }
      else{
        res.status(200).json({Status: false, Message:"Wrong Code"});
      }
  }
  catch(err){
    console.log(err)
    res.status(500).send('Authorizatsadf');
  }
  });


  //////new Pass set
  router.post('/new-password', async (req, res)=>{
    try{
      const userJsonData = await User.findOne({ email: req.body.email, VerifyCode:req.body.verifyCode});
  if (userJsonData) {
    /// // Username found
      if(req.body.password.length>=6) {
            const passwords = await passwordhashing(req.body.password);
        ///Pass Up 6 Digit
            const updateResult = await  User.updateOne({email: req.body.email}, {password: passwords});
            if(updateResult && updateResult.modifiedCount > 0){
            ////Update pass to database
            res.status(200).json({Status:true});
            }
          else{
            res.status(200).json({Status: false, Message:"Server Error"});
          }
          }
          else{
            res.status(200).json({Status: false, Message:"Password To Short"});
          }
        }
        else{
          res.status(200).json({Status: false, Message:"Wrong Code"});
        }
        
    }
    catch(err){
      console.log(err)
      res.status(500).send('Authorizatsadf');
    }
    });



  
/////all_user
router.post('/all_user', authCheck, async (req, res)=>{
  try{
    if(req.userName){
      if(req.user_decoted_Data?.type==='admin'){
        const userData = await User.find();
    res.status(200).json(userData);
      }

      else{
        res.status(500).send('Authorization failed!');
      }
    }
    else{
      res.status(500).send('Authorization failed!');
    }
  }
  catch{
    res.status(500).send('Authorization failed!');
  }
  });



/////Update user Data
router.post('/update-user-data', authCheck, async (req, res)=>{
  try{
    if(req.userName){
      if(req.user_decoted_Data?.type==='admin'){
        

////////ব্যবহারকারীদের আপডেট করতে হবে
const userJsonData = await User.findOne({ _id: req.body.ID});
        if (userJsonData) {
      const updateResult = await  User.updateOne({_id: req.body.ID}, 
        {status: userJsonData.status==="Active"?"unaAtive":"Active"});
      if(updateResult && updateResult.modifiedCount > 0){
        const userData = await User.find();
        res.status(200).json(userData);
      }
      else{
        res.status(500).json({Status:  false, Message: "Server Error Try agin"});
      }
    }
    else{

      res.status(500).json({Status:  false, Message: "Server Error Try agin"});
    }




      }

      else{
        res.status(500).send('Authorization failed!');
      }
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