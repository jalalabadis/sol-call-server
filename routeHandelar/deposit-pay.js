const express = require('express');
const router = express.Router();
const multer  = require('multer');
const path = require('path');
const DepositPay = require('../models/DepositPay');


////File uplode
const storage = multer.diskStorage({
    destination: (req, file, cb)=> {
      cb(null, 'uploads')
    },
    filename:  (req, file, cb) =>{
      const fileExt = path.extname(file.originalname);
      const fileName = file.originalname
                            .replace(fileExt, "")
                            .toLowerCase()
                            .split(" ")
                            .join("-")+"-"+Date.now();
      cb(null, fileName+fileExt)
    }
  })
  
  const upload = multer({ storage: storage });

////Bank add
router.post('/add', upload.single('file'), async(req, res)=>{
  try {
    await DepositPay.create({
        methodName: req.body.depositName,
        targetZone: req.body.targetZone,
        addressType: req.body.addressType,
        receiverAddress:req.body.receiverAddress,
        notes: req.body.notes,
        depositImage: req.file.filename,
    });
    const DepositPayData = await DepositPay.findAll();
    res.status(200).json(DepositPayData);
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});


////Bank Update
router.post('/update', upload.single('file'), async(req, res)=>{
    try {
        const depositPayData = await DepositPay.findOne({ where: { id: req.body.id }});
        if(depositPayData){
      await depositPayData.update({
          methodName: req.body.depositName,
          targetZone: req.body.targetZone,
          addressType: req.body.addressType,
          receiverAddress:req.body.receiverAddress,
          notes: req.body.notes,
          depositImage: req.file?.filename?req.file.filename:depositPayData.depositImage,
      });
      const DepositPayDatas = await DepositPay.findAll();
      res.status(200).json(DepositPayDatas);
    }
    else{
        res.status(500).send('Internal server error');
    }
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });


  ////Bank remove
router.post('/remove', async(req, res)=>{
    try {
        const depositPayData = await DepositPay.findOne({ where: { id: req.body.id }});
        if(depositPayData){
      await depositPayData.destroy();
      const DepositPayDatas = await DepositPay.findAll();
      res.status(200).json(DepositPayDatas);
    }
    else{
        res.status(500).send('Internal server error');
    }
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });

////Bank all
router.post('/', async(req, res)=>{
    try {
      const DepositPayData = await DepositPay.findAll();
      res.status(200).json(DepositPayData);
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });


//Export
module.exports = router;