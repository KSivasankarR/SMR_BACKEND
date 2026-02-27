const logger = require('../../config/winston');
const casteMOdel = require('../../models/cast.model');
const jwt = require('../../services/auth.service');
const fs = require("fs");
const path = require("path");
/**
   * @api : /caste,
   * @apiType : POST,
   * @apiDesc : Creating Caste Details
   * @apiResponse : 200,Success Response
*/
const addCast =async (req,res) => {
    try {
        let filepath = path.join(__dirname, "./cast.json");
        const jsonString = fs.readFileSync(filepath);
        const customer = JSON.parse(jsonString);
        return new Promise((resolve, reject) => {
            casteMOdel.create(customer)
                    .then(response => {
                        resolve("Data added");
                    }).catch(err => reject(err));
        });
    } catch (err) {
        logger.error("process error" + err.message);
        console.log("process error" + err.message);
    }
};

/**
   * @api : /caste/castDetails,
   * @apiType : GET,
   * @apiDesc : Get casteDetails
   * @apiResponse : 200,Success Response
*/
const castDetails =async (req,res) => {
    try {
		const data = await casteMOdel.find({});
        logger.info(`castDetails ::::: ${data}`)                                         
		if(data){
			res.status(200).send({Success:true,data:data})
		}else{
			res.status(400).send({Success:false,data:null,message:`Something Went Wrong,bad request`})
		}
    } catch (err) {
        logger.error('error :::',err)                                         
        res.status(500).send({Success:false,data:null,message:`Something Went Wrong,bad request`})
    }
};
/**
   * @api : /caste/subCastDetails,
   * @apiType : POST,
   * @apiDesc : Get SubCasteDetails
   * @apiResponse : 200,Success Response
*/
const subCastDetails = async (req,res) => {
    try {

		const data = await casteMOdel.find({},{subCastName:1,_id:0}).sort({subCastName: 1});
        logger.info(`subCastDetails ::::: ${data}`)                                                                             
		if(data.length ===0){
			res.status(400).send({Success:false,data:null,message:`No data found`})
		}else{
			let subCaste =[];
			data.map((x)=>{
				subCaste = [...subCaste,x.subCastName]
			})
			res.status(200).send({Success:true,data : subCaste})
		}
    } catch (err) {
        logger.error("process error" + err.message);
        console.log("process error" + err.message);
    }
};
module.exports ={castDetails,subCastDetails,addCast}