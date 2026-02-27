const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sequenceSchema = new mongoose.Schema({
    
	sroDistrict:{type:String},
	sroOffice:{type:String},
	sroNumber:{type:Number},
	sroName:{type:String},
	sequence:{type:Number},
	cer_sequence:{type:Number}
},{timestamps:true})

module.exports = mongoose.model("SequenceSro", sequenceSchema,"SequenceSro");

