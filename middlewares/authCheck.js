const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authCheck = async (req, res, next)=>{
    try{
    const decoted = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const {userName} = decoted;
    const user = await User.findOne({ where: { userName: userName }});
    await user.update({last_seen: new Date()});
    req.userData = user;
    next();
    }
    catch{
    next()
    }
};

module.exports = authCheck;