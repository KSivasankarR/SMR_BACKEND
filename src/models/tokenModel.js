const mongoose = require('mongoose');


var TokenSchema = new mongoose.Schema({
	userId:{type:String},
	loginType:{type:String},
	refreshToken:{type:String},
	status:{type:Boolean}
},{timestamps:true})


module.exports = mongoose.model("token", TokenSchema);