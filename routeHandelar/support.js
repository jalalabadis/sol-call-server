const express = require('express');
const router = express.Router();
const path = require('path');
const Job = require('../models/Job');
const User = require('../models/User');
const Notify = require('../models/Notify');
const authCheck = require('../middlewares/authCheck');
const Task = require('../models/Task');
const { Sequelize, Op, DataTypes } = require('sequelize');
const adminCheck = require('../middlewares/adminCheck');
const Support = require('../models/Support');
const Messages = require('../models/Messages');
const Admin = require('../models/Admin');




////New Support Add by Admin
router.post('/add-admin', adminCheck, async(req, res)=>{
  try {
    if(req.admin){
      const user = await User.findOne({ where: { userName: req.body.userName }});
      if(user){
      await user.update({
        support: true,
      });

   const newSupport = await Support.create({
      subject: req.body.subject,
      status: 'open',
      userName: req.body.userName
    });

     await Messages.create({
      message: req.body.message,
      sender_type: 'support',
      status: true,
      supportID:newSupport.id,
      userName:req.body.userName
    });

    const allSupportData = await Support.findAll({
      include: {
        model: User, 
        attributes: ['firstName', 'lastName', 'userName', 'email', 'avatar'],
      }
    });
    allSupportData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.status(200).json(allSupportData);
  }
    else{
      res.status(500).send('UserName error');
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


////New Support Add by Admin
router.post('/add-user', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){
      const user = await User.findOne({ where: { userName: req.userData?.userName }});
      if(user){
       ////admin Update
       await Admin.update(
        { notify:true },
        { where: { notify: false } }
      ); 

   const newSupport = await Support.create({
      subject: req.body.subject,
      status: 'open',
      userName: req.userData?.userName
    });

     await Messages.create({
      message: req.body.message,
      sender_type: 'support',
      status: true,
      supportID:newSupport.id,
      userName:req.userData?.userName
    });

    res.status(200).json(newSupport.id);
  }
    else{
      res.status(500).send('UserName error');
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

 
////Support List all For Admin
router.post('/', adminCheck, async(req, res)=>{
    try {
      if(req.admin){
      const supportData = await Support.findAll({
        include: {
          model: User, 
          attributes: ['firstName', 'lastName', 'userName', 'email', 'avatar'],
        }
      });
      supportData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.status(200).json(supportData);
    }
    else{
      res.status(500).send('Internal server error');
    }
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });


  ////Support List all For User
router.post('/user-ticket', authCheck, async(req, res)=>{
  try {
    if(req.userData?.userName){
    const supportData = await Support.findAll({ where: { userName: req.userData?.userName }});
    supportData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(supportData);
  }
  else{
    res.status(500).send('Internal server error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});

  ////Message By support by all admin user
router.post('/chat', async(req, res)=>{
  try {
    const supportData = await Support.findOne({ where: { id: req.body.supportID }});
    const chatData = await Messages.findAll({ where: { supportID: req.body.supportID }});
    res.status(200).json({chatData, supportData});
  }
 catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});




////////////=============New Message================//////////
router.post('/new-message', async(req, res)=>{
  try {
    const support = await Support.findOne({ where: { id: req.body.supportID }});
    if(support){
      const user = await Support.findOne({ where: { userName: support.userName }});
      /////user Update
      await user.update({
        support: req.body.sender_type==='support'?true:false
      });
      ////admin Update
      await Admin.update(
        { notify: req.body.sender_type==='support'?false:true },
        { where: { notify: false } }
      ); 
      
      ////New message
      await Messages.create({
        message: req.body.newMessage,
        sender_type: req.body.sender_type,
        status: true,
        supportID:req.body.supportID,
        userName:support.userName
      });
    
      const chatData = await Messages.findAll({ where: { supportID: req.body.supportID }});
      res.status(200).json(chatData);
    
  }
  else{
    res.status(500).send('Support error');
  }
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});


  ////Close Ticket
  router.post('/close', authCheck, async (req, res) => {
    try {
      const support = await Support.findOne({ where: { id: req.body.supportID }});
      if(support){
        /////user Update
        await support.update({
          status: 'close'
        });
        
      
        const allSupportData = await Support.findAll({
          include: {
            model: User, 
            attributes: ['firstName', 'lastName', 'userName', 'email', 'avatar'],
          }
        });
        allSupportData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        res.status(200).json(allSupportData);
      
    }
    else{
      res.status(500).send('Support error');
    }
    } catch (error) {
      console.error('Failed to retrieve job data:', error);
      res.status(500).send('Internal server error');
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
        support: false,
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