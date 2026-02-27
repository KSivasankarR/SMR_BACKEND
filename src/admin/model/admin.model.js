const mongoose = require("../../services/mongoose.service").mongoose;
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    userName: { type: String },
    password: { type: String }
});

module.exports = mongoose.model("admins", adminSchema, "admins");
