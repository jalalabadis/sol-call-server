const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const path = require('path');
const multer  = require('multer');
const User = require('../models/User');
const DepositRequest = require('../models/DepositRequest');
const WithdrawRequest = require('../models/WithdrawRequest');
const TemporaryUser = require('../models/TemporaryUser');
const authCheck = require('../middlewares/authCheck');
const emailSend = require('../middlewares/emailSend');
const generateRandomCode = require('../middlewares/generateVerifyCode');
const checkValidEmail = require('../middlewares/checkValidEmail');
const passwordhashing = require('../middlewares/passwordhashing');
const bcrypt = require('bcrypt');
const sendConfirmationEmail = require('../middlewares/emailSend');
const generateSecretKey = require('../middlewares/generateSecretKey');
const onUserSuccessRate = require('../middlewares/onUserSuccessRate');




// Set storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    const fileName = file.originalname
      .replace(fileExt, "")
      .toLowerCase()
      .split(" ")
      .join("-") + "-" + Date.now();
    cb(null, fileName + fileExt);
  }
});

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

// Set upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: fileFilter
});



////Profile Status
router.post('/', async(req, res)=>{
    if(req.body.profileID){
       
        
  try {
    const user = await User.findOne({ where: { userName: req.body.profileID }});

    if (!user) {
      return res.status(404).send('User not found');
    }

//////////////////Deposit and Withdraw data//////////////////////////
    const userApprovedDeposit = await DepositRequest.findAll({where: {userName: req.body.profileID, status: 'approved'}});
    const userApprovedWithdraw = await WithdrawRequest.findAll({where: {userName: req.body.profileID, status: 'approved'}});
    
    const depositsWithKey = userApprovedDeposit.map(deposit => ({
      ...deposit.dataValues,
      transactionType: 'Deposit'
    }));
    
    const withdrawsWithKey = userApprovedWithdraw.map(withdraw => ({
      ...withdraw.dataValues,
      transactionType: 'Withdraw'
    }));
    // Combine the data into a single array
    const activityData = [...depositsWithKey, ...withdrawsWithKey];
    activityData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const depositAmount = userApprovedDeposit?.reduce((total, item) => total + parseFloat(item.amount), 0);
    const withdrawAmount = userApprovedWithdraw?.reduce((total, item) => total + parseFloat(item.amount), 0);


    
    ////Success Rate
    const successRate = await onUserSuccessRate(req.body.profileID);
    /////Last Seen
    const lastSeenMessage = getLastSeenMessage(user.last_seen);
    res.status(200).json({ ...user.toJSON(), last_seen: lastSeenMessage, successRate, activityData, depositAmount, withdrawAmount});
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
    }
    else{
        res.status(500).send('Authorization failed!');
    }
});


/////Edit User Profile Image
router.post('/edit-profile-image', upload.single('file'), authCheck, async (req, res)=>{
      try{
        if(req.userData?.userName){
          const user = await User.findOne({ where: { userName: req.userData?.userName }});
    
             ///User Update
             await user.update({
              avatar: req.file.filename
            });
           
            res.status(200).json(user);
        }
        else{
          res.status(200).json({Status: false, Message:"User not found" });
        }
      }
      catch{
        res.status(500).send('Authorization failed!');
      }
      });
    

function getLastSeenMessage(lastSeen) {
    const now = new Date();
    const diffMs = now - lastSeen;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
  
    if (diffSec < 60) {
      return 'Online';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }
  };
//Export
module.exports = router;