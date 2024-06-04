const express = require('express');
const router = express.Router();
const multer  = require('multer');
const path = require('path');
const WithdrawPay = require('../models/WithdrawPay');


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

////WithdrawControl add
router.post('/add', upload.single('file'), async(req, res)=>{
  try {
    await WithdrawPay.create({
        methodName: req.body.withdrawName,
        targetZone: req.body.targetZone,
        addressType: req.body.addressType,
        receiverAddress:req.body.receiverAddress,
        notes: req.body.notes,
        bankImage: req.file.filename,
    });
    const WithdrawPayData = await WithdrawPay.findAll();
    res.status(200).json(WithdrawPayData);
  } catch (error) {
    console.error('Failed to retrieve last seen timestamp:', error);
    res.status(500).send('Internal server error');
  }
});


////Bank Update
router.post('/update', upload.single('file'), async(req, res)=>{
    try {
        const WithdrawPayData = await WithdrawPay.findOne({ where: { id: req.body.id }});
        if(WithdrawPayData){
      await WithdrawPayData.update({
          methodName: req.body.withdrawName,
          targetZone: req.body.targetZone,
          addressType: req.body.addressType,
          notes: req.body.notes,
          bankImage: req.file?.filename?req.file.filename:WithdrawPayData.bankImage,
      });
      const WithdrawPayDatas = await WithdrawPay.findAll();
      res.status(200).json(WithdrawPayDatas);
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
        const WithdrawPayData = await WithdrawPay.findOne({ where: { id: req.body.id }});
        if(WithdrawPayData){
      await WithdrawPayData.destroy();
      const WithdrawPayDatas = await WithdrawPay.findAll();
      res.status(200).json(WithdrawPayDatas);
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
      const WithdrawPayData = await WithdrawPay.findAll();
      res.status(200).json(WithdrawPayData);
    } catch (error) {
      console.error('Failed to retrieve last seen timestamp:', error);
      res.status(500).send('Internal server error');
    }
  });


//Export
module.exports = router;