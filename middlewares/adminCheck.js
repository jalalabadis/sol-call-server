const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getClientIp = require('./getClientIp');

const adminCheck = async (req, res, next)=>{
    try{
    const decoted = jwt.verify(req.body.token, process.env.JWT_SECRET);
    req.admin = decoted;
    next();
    }
    catch{
    next()
    }
};

module.exports = adminCheck;