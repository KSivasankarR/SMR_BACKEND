const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const officerSchema = new Schema({

  district: { type: String },
  loginType:{type:String, default:"OFFICER",required:true},
  loginKey: { type: String },
  loginName: { type: String },
  loginEmail: { type: String , required:true},
  loginMobile: { type: String , required:true},
  loginPassword: { type: String , required:true},
  sroDistrict:{type:String,required:true},
  sroMandal:{type:String},
  sroOffice:{type:String,required:true},
  sroNumber:{type:String,required:true},
  sroName:{type:String},
  subDistrict: { type: Array },
  role:{type:String},
  lastLogin:{type:String},
  loginStatus:{ type: String ,default: "" },
  updatedAt: { type: Date },
  loginAttemptsLeft: { type: String },
  loginBlockedUntil: { type: Date },
  villageName: { type: String },
  villageCode: { type: String },
  villageScretariatName: { type: String },
  villageScretariatCode: { type: String },

},{timestamps:true});

module.exports = mongoose.model("officers", officerSchema, "officers");