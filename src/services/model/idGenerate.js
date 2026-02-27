const mongoose = require('mongoose')

const uniqueSchema = new mongoose.Schema({
    sroNumber: {
        type: String,
    },
    sequenceValue:{
        type: Number,
        required: true
    },
	noticeName:{
		type:String
	},
	year:{
		type:String
	}


})
module.exports = mongoose.model('UsersUniqueId',uniqueSchema)