const jwt = require('jsonwebtoken');
const User = require('../models/User');
const getClientIp = require('./getClientIp');

const authCheck = async (req, res, next)=>{
    try{
    const decoted = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const {userName} = decoted;
    const user = await User.findOne({ where: { userName: userName }});
    const ipInfo = await getClientIp(req);
    await user.update(
        {last_seen: new Date(),
        ip: ipInfo.ip,
        country: ipInfo.country,
        proxy: ipInfo.proxy
        }
    );
    req.userData = user;
    next();
    }
    catch{
    next()
    }
};

module.exports = authCheck;