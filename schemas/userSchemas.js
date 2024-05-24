const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   firstName: {
      type: String,
      required: true
    },
    lastName: {
        type: String,
        required: true
      },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    type: {
        type: String,
        required: false
    }
    ,
    status: {
        type: String,
        required: false
    },
    VerifyCode: {
        type: String,
        required: false
    }
});

module.exports = userSchema;