const jwt = require('jsonwebtoken');

const authCheck = (req, res, next)=>{
    try{
    const decoted = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const {firstName, lastName, userName, email, type} = decoted;
    req.user_decoted_Data = {firstName, lastName, userName, email, type};
    req.lastName = lastName;
    req.userName = userName;
    req.email = email;
    req.type = type;

    next();
    }
    catch{
    next()
    }
};

module.exports = authCheck;