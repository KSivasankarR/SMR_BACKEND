const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    loginEmail: { type: String },
    otp: { type: String },
	otpType:{type:String},
    status:{type:Boolean},
	sendCount:{type:Number},
	validateCount:{type:Number},
	isValidate:{type:Boolean}

},{timestamps:true});

module.exports = mongoose.model("otp", otpSchema,'otp');