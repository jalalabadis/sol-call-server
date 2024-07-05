const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Connection, PublicKey, clusterApiUrl } =  require('@solana/web3.js');
const getGoodManAmount = require('./getGoodManAmount');


const authCheck = async (req, res, next)=>{
    try{
    const decoted = jwt.verify(req.body.token, process.env.JWT_SECRET);
    const {wallet} = decoted;
    const user = await User.findOne({ where: { wallet: wallet }});
    if (user) {
        const userResponse = user.toJSON();
        const goodman = await getGoodManAmount(wallet);
        userResponse.goodman = Number(goodman);
        req.userData = userResponse;
      } else {
        req.userData = null; 
      }
    next();
    }
    catch{
    next()
    }
};

module.exports = authCheck;