const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const castSchema = new Schema({
    castName: { type: String },
    subCastName: { type: String }

});

module.exports = mongoose.model("cast", castSchema, "cast");
