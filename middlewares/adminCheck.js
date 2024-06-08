const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminCheck = async (req, res, next)=>{
    try{
    const decoted = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const {userName} = decoted;
    const admin = await Admin.findOne({ where: { userName: userName }});
    req.admin = admin;
    next();
    }
    catch{
    next()
    }
};

module.exports = adminCheck;