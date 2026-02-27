const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    loginEmail: { type: String },
    otp: { type: String },
    status:{type:Boolean}

},{timestamps:true});

module.exports = mongoose.model("otp", otpSchema,'otp');