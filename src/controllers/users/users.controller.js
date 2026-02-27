const userModel = require('../../models/users.model');
const officerModel = require('../../models/officer.model');
const otpModel = require('../otp/model/otp.model');
const gToken = require('../../services/auth.service');
const nodemailer = require("nodemailer");
const sequenceModel = require('../../models/sequence');
const moment = require('moment');
const helper = require('../../utils/helper');
const sysConstants = require('../../utils/sysConstanst');
const ObjectId = require('mongoose').Types.ObjectId;
const {dateFormat} = require('../../utils/helper');
const {SortAndPaginator} = require('../../common/paginator');
const {userValidations} = require('../../utils/validation');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const fileUploadPath = require('../../common/fileUpload');
const axios = require('axios');
const logger = require('../../config/winston');
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[a-zA-Z\d@$!%*#?&]{8,}$/;
/**
   * @api : /users/signup,
   * @apiType : POST,
   * @apiDesc : Signup for USER
   * @apiResponse : 200,Success Response
*/
const singup = async(req,res) => {
	const reqBody = req.body;
	logger.info(`signup reqBody ::::: ${JSON.stringify(reqBody)}`)
	if(reqBody?.loginEmail == null){
		return res.status(404).send({Success:false,message:"Email is Required"});
	};
	if(!passwordPattern.test(reqBody.loginPassword)){
		return res.status(404).send({Success:false,message:'Password should meet the password policy.!'});
	}
	let otpVerify=await otpModel.findOne({loginEmail:reqBody.loginEmail,otpType:"regOtp",otp:reqBody.otp})
    logger.info(`otpVerify ::::: ${otpVerify}`)
	if(otpVerify == null){
		return res.status(404).send({Success:false,message:"Otp  is Invalid"});
	}
    try {
		
		const findUser = await userModel.findOne({"loginEmail":reqBody.loginEmail});
		logger.info(`findUser ::::: ${findUser}`)
		if(findUser){
			return res.status(400).send({Success:false,message:`${process.env.BAD_REQUEST}`});
		}else{
			const userData = new userModel(reqBody);
			const saveUser = await userData.save();
			let obj = {
				"loginEmail":saveUser.loginEmail,
				"loginMobile" :saveUser.loginMobile,
				"LoginName":saveUser.loginName,
				_id:saveUser._id
			}
			logger.info(`saveUser ::::: ${saveUser}`)
			if(saveUser){
				return res.status(200).send({status:200,data:obj,message:`User Created Successfully!`});
			}else{
				return res.status(400).send({status:400,data:null,message:`${process.env.BAD_REQUEST}`});
			}
		}
    } catch (err) {
		logger.error('error :::',err)
        res.status(500).send({status:500,data:null,message:`Internal Server Problem`})
    }
};

/**
   * @api : /users/login,
   * @apiType : POST,
   * @apiDesc : login for USER
   * @apiResponse : 200,Success Response
*/
const login =async (req,res) => {
    try {
		const reqBody = req.body;
		logger.info(`login reqBody ::::: ${JSON.stringify(reqBody)}`)
		if(!reqBody.loginEmail || !reqBody.loginPassword){
			return res.status(400).send({
				message: "Invalid Request"
			})
		}
		const query = {"loginEmail":reqBody.loginEmail,"loginPassword":reqBody.loginPassword}
		var date = new Date();
		var dateStr =
		("00" + date.getDate()).slice(-2) + "-" +
        ("00" + (date.getMonth() + 1)).slice(-2) + "-" +
		date.getFullYear() + " " +
		("00" + date.getHours()).slice(-2) + ":" +
		("00" + date.getMinutes()).slice(-2) + ":" +
		("00" + date.getSeconds()).slice(-2);

		let lastLogin=dateStr;

		// Block login until that timestamp
		const findUserQuery = { "loginEmail": reqBody.loginEmail, "loginPassword": reqBody.loginPassword };
		let user = await userModel.findOne(findUserQuery);
		logger.info(`userdata ::::: ${user}`)

		if(!user){
			return res.status(404).send({
				message: "User Not Found"
			})
		}
		else if (user){
			if(user.loginAttemptsLeft === 0){
				if (moment().isBefore(moment(user.loginBlockedUntil))) {
					return res.status(403).send({
						message: `Login is blocked until ${moment(user.loginBlockedUntil).format('MMM DD YYYY hh:mm:ss A')}`
					});
				} else {
					user = await resetUserTrials(findUserQuery);
				}
			}
			if(user){
				let loginAttemptsLeft = 0;
				if(user.loginPassword !== reqBody.loginPassword){
					loginAttemptsLeft = user.loginAttemptsLeft ? user.loginAttemptsLeft - 1 : 4;
					await userModel.findOneAndUpdate(findUserQuery, { $set: loginAttemptsLeft === 0 ? { loginAttemptsLeft, loginBlockedUntil: new Date(moment().add('5', 'minutes')) } : {loginAttemptsLeft} });
					return res.status(400).send({
						message: "Invalid Email ID/ Password"
					})
				} else {
					await userModel.findOneAndUpdate(findUserQuery, {$set: {loginAttemptsLeft: 5, lastLogin}});
					const userDetails = await getUserInfo(user);
					logger.info(`userDetails ::::: ${userDetails}`)
					let tokenUrl = req.protocol + "://" + req.get("host") + "/smr/token/";
					userDetails.token = await gToken.createToken(userDetails,tokenUrl);
					return res.status(200).send(
                		{	success:true,
                    		data:userDetails
                		}
            		);
				}
			} else {
				return res.status(400).send({
					message: 'Bad Request'
				})
			}
		}

		
    } catch (ex) {
		console.log("ERROR ::",ex);
		logger.error(" error ::: ", ex);
		res.status(500).send({
            success: false,
            message:'Internal Server Problem',
            data: "",
        });
    }
};

const resetUserTrials = async (findUserQuery) => {
	return await userModel.findOneAndUpdate(findUserQuery, 
		{ $set: { loginAttemptsLeft: 5, loginBlockedUntil: null } }, {returnOriginal: false}
	);
}


const otpValidate =async (req,res) => {
    try {
		const reqParams = req.params;
		const reqBody = req.body;
		const filters = {loginEmail:reqBody.loginEmail,otp:reqBody.otp,otpType:reqParams.otpType
		}
		const query1 = {loginEmail:reqBody.loginEmail,"otp":reqBody.otp,otpType:reqParams.otpType,status:reqBody.status,isValidate:true}
		const otpVerify = await otpModel.findOne(filters);
		logger.info(`otpVerify ::::: ${otpVerify}`)
		// if(!otpVerify){
		// 	return res.status(400).send({Success:false,message:	`Bad Request`});
		// };
		if((otpVerify?.otpType == "regOtp" || otpVerify?.otpType == "forgetOtp") && otpVerify?.sendCount <= 1|| otpVerify?.validateCount <= 1){
			return res.status(400).send({Success:false,message:	otpVerify ? 'You have exceeded OTP verification attempts' : `${process.env.BAD_REQUEST}` });
		}
		if(otpVerify !== null && otpVerify.sendCount > 1){
			verify = await otpModel.findOneAndUpdate(filters,{$set:query1})
			logger.info(`verify ::::: ${verify}`)
			res.status(200).send({Success:true,message:"Otp Verified Successfully!!"})
		}else{
			let countDown = await otpModel.findOne({loginEmail:reqBody.loginEmail});
			logger.info(`countDown ::::: ${countDown}`)
			let cDown = countDown.validateCount -1;
			if(cDown === 0){
				return res.status(402).send({Success:false,message:`You have exceeded OTP verification attempts. Try with resend OTP.`})	
						
			}
			else{
				await otpModel.findOneAndUpdate({loginEmail:reqBody.loginEmail},{$set:{validateCount:cDown}});
				return res.status(400).send({Success:false,message:	`OTP is invalid, you have only ${cDown} attempts.`})
			}
			
		}
    } catch (err) {
		logger.error('error :::',err)
        res.status(500).send({message:'Internal Server Problem'});
    }
};
const emailVerification = async (req,res) => {

    try {
		
		let UserExist = await userModel.findOne({"loginEmail":req.body.loginEmail});
		logger.info(`UserExist ::::: ${UserExist}`)
		if(UserExist){
			return res.status(400).send({Success:false,message:"Email ID already exists"})
		}
        let transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com",
			// smtp.office365.com
            port: 587,
            //secure: false,
            ssl:true,
            auth: {
              user: `${process.env.SMTP_EMAIL}`,
              pass: `${process.env.SMTP_PASSWORD}`,
            },
        });
		logger.info(`transporter ::::: ${transporter}`)	
		const query = {"loginEmail":req.body.loginEmail};
		let senCountValidation = await otpModel.findOne(query);
		logger.info(`senCountValidation ::::: ${senCountValidation}`)	
		let otp = Math.floor(1000 + Math.random() * 9000);
		if(senCountValidation){
			let sendCountVal = senCountValidation.sendCount -1;
			if(sendCountVal <= 0){
				if(((new Date().getTime() - new Date(senCountValidation.updatedAt).getTime()) / (1000*60*60)) >= 1){
					const info = await transporter.sendMail({
						from: `"IGRS" <${process.env.SMTP_EMAIL}>`, // sender address
						to: req.body.loginEmail, // list of receivers
						subject: "Email Verification", // Subject line
						text: "Hi user, ", // plain text body
						html: `<b>OTP to verify the email ${otp} </b>`
					});
					logger.info(`info ::::: ${info}`)
					await otpModel.findOneAndUpdate(query,{$set:{sendCount:5, validateCount: 5}});
					return res.status(200).send({message:"OTP Sent to Your Email Successfully"})
				}else{
					return res.status(400).send({message:"You have exceeded OTP request.Try after one hour"})
				}
			}
			const info = await transporter.sendMail({
				from: `"IGRS" <${process.env.SMTP_EMAIL}>`, // sender address
				to: req.body.loginEmail, // list of receivers
				subject: "Email Verification", // Subject line
				text: "Hi user, ", // plain text body
				html: `<b>OTP to verify the email ${otp} </b>`
			});
			logger.info(`info ::::: ${info}`)	
			await otpModel.findOneAndUpdate(query,{$set:{sendCount:sendCountVal,otp:otp, validateCount: 5}});
			return res.status(200).send({message:"OTP Sent to Your Email Successfully"})
		}else{
			const info = await transporter.sendMail({
				from: `"IGRS" <${process.env.SMTP_EMAIL}>`, // sender address
				to: req.body.loginEmail, // list of receivers
				subject: "Email Verification", // Subject line
				text: "Hi user, ", // plain text body
				html: `<b>OTP to verify the email ${otp} </b>`
			});
			const data = info.messageId;
			console.log("mail sent id",info);
			logger.info(`mail sent id ::::: ${info}`)
			const reqData = {loginEmail:req.body.loginEmail,otp:otp,status:true,validateCount:5,isValidate:false,sendCount:5}
			reqData.otpType= 'regOtp';
			await otpModel.findOneAndUpdate(query,{$set:reqData},{upsert:true});
			delete reqData.otp;
			return res.status(200).send({message:"OTP Sent to Your Email Successfully"})
		}
    } catch (err) {
		logger.error('error :::',err)	
        res.status(500).send({message:'Internal Server Problem'})
    }
};
/**
   * @api : /users/saveUser/{id}, 
   * @apiType : PUT,
   * @api @param {id} is uniqueID,
   * @apiDesc : Update for USER
   * @apiResponse : 200,Success Response
*/
const saveUser =async (req,res) => {
    try {
		const reqParams = req.params
		const reqBody = req.body;
		let validation = await userValidations(reqBody);
	    logger.info(`validation ::::: ${JSON.stringify(validation)}`)                                                                               
		if(validation && validation.status == false){
			return res.status(400).send({Success:false,message:validation.err})
		}
		const filter ={"_id":ObjectId(reqParams.id)};
		const checkUser = await helper.findOneMethod(sysConstants.Col_users,filter);
		logger.info(`checkUser ::::: ${JSON.stringify(checkUser)}`)
		if(checkUser === undefined){
			res.status(404).send({Success:false,message:`User not Existed`})
		}else{
				let query = {sroDistrict:reqBody.sroDistrict,sroOffice:reqBody.sroOffice};
				let getCode = await helper.findOneMethod(sysConstants.Col_Officers,query);
				reqBody.status="PENDING";
				if(getCode?.sroNumber){
					reqBody.sroNumber= parseInt(getCode.sroNumber)
					// reqBody.sroNumber= getCode.sroNumber
				}
				if(!checkUser.applicationId){
					reqBody.applicationId = await generateDocumentId(getCode.sroNumber);
				}
				// reqBody.regDate =reqBody.regDate || reqBody.regDate != "" ?await dateFormat(reqBody.regDate):"";
				// reqBody.marriageDate =reqBody.marriageDate || reqBody.marriageDate != ""?await dateFormat(reqBody.marriageDate):""
				// reqBody.wifeDateofBirth =reqBody.wifeDateofBirth || reqBody.wifeDateofBirth != ""?await dateFormat(reqBody.wifeDateofBirth):""
				// reqBody.wifeDateofBirth =reqBody.wifeDateofBirth || reqBody.wifeDateofBirth != ""?await dateFormat(reqBody.wifeDateofBirth):""
				// reqBody.husbandDateofBirth =reqBody.husbandDateofBirth || reqBody.husbandDateofBirth != ""?await dateFormat(reqBody.husbandDateofBirth):""
				// reqBody.slotDate = reqBody.slotDate || reqBody.slotDate != ""?await dateFormat(reqBody.slotDate):"";
				for(let i in reqBody){
					if(['husbandDateofBirth','husbandDivorceDate', 'wifeDateofBirth', 'wifeDivorceDate', 'slotDate', 'regDate', 'marriageDate', 'husbandLengthofResidence', 'wifeLengthofResidence'].includes(i)){
						if(reqBody[i]){
							reqBody[i] = new Date(`${reqBody[i]}T00:00:00Z`);
						}
					}
				}
				reqBody.actionDate = new Date()
				const userData = await helper.fAndUpdateMethod(sysConstants.Col_users,filter,reqBody);
				logger.info(`userData ::::: ${JSON.stringify(userData)}`)
				if(userData.value === null){
					res.status(400).send({Success:false,data:null,message:`${process.env.BAD_REQUEST}`})
				}else{
					userData.value.applicationId = reqBody.applicationId;
					res.status(200).send({Success:true,data:userData.value,message:`User Updated Successfully!!`})
				}
		}

    } catch (ex) {
		console.log(ex);
		logger.error("error :::",ex);
        res.status(500).send({Success:false,message:'Internal Server Problem'})
    }
};

const whatsAppNotificationForSMR = async (params) => {
    try {
        const config = {
            method: 'post',
            url: `${process.env.RTGS_WHATSAPP_URL}`,
            data: {
                "receiver": params.mobileNumber,
                "send_template": params.templateId,
                "parameters": {
                    "document": params.docNo,
                    "year_code": params.regYear,
                    "sr_code":params.sroName
                },
                "filepath": params.fileLink
            }
        };
		logger.info(`config ::::: ${config}`)
        const finalResponse = await axios.post(config.url, config.data);
		logger.info(`finalResponse ::::: ${finalResponse}`)
        if (finalResponse.data) {
            console.log('document send notification - Whatsapp SMR Copy || Success')
        }
 
    } catch (ex) {
		logger.error("error :::",ex);
        console.error("document send notification - Whatsapp SMR Copy || Error :", ex);
    }
}
/**
   * @api : /users/update/{applicationId},
   * @apiType : PUT,
   * @api @param {applicationId} is a unique id for USER,
   * @apiDesc : Update the Status for USER
   * @apiResponse : 200,Success Response
*/
const statusUpdate  = async(req,res)=>{
	const reqBody =req.body;
	const reqParams = req.params;
	logger.info(`reqBody ::::: ${JSON.stringify(reqBody)}`)
	logger.info(`reqParams ::::: ${JSON.stringify(reqParams)}`)
	if(reqBody.status == null){
		return res.status(404).send({Success:false,message:`Bad Request, Status not Found`})
	}
	if(!["REJECTED", 'ACCEPTED'].includes(reqBody.status)){
		return res.status(400).send({Success: false, message: `${process.env.BAD_REQUEST}`})
	}
	try{
		let query;
		let filter ={applicationId :reqParams.applicationId}
		let user = await userModel.findOne(filter);
		logger.info(`user ::::: ${user}`)
		if(!user || ["REJECTED", 'ACCEPTED'].includes(user.status) || !user.issetToNotice){
			return res.status(400).send({Success: false, message: `${process.env.BAD_REQUEST}`})
		} else if(user && user.issetToNotice && user.noticeEndDate){
			
			if(!user.noticeEndDate || new Date() <= new Date(user.noticeEndDate)){
				return res.status(400).send({Success: false, message: `${process.env.BAD_REQUEST}`});
			}
			else if(reqBody.status == "REJECTED"){
				query = {status:reqBody.status,reasonForRejection:reqBody.reasonForRejection,actionDate:new Date()}
			}else{
				query = {status:reqBody.status,actionDate:new Date()}
			}
			let update = await helper.fAndUpdateMethod(sysConstants.Col_users,filter,query);
			logger.info(`status update ::::: ${update}`)
			let mobileNumbers = [user.husbandMobile, user.wifeMobile];
                let templateId = process.env.SMR_WHATSAPP_TEMPLATE;
                let date = new Date().getFullYear().toString()
				let sroCode = user.sroNumber.toString();
				let docNumber = `SMR${new Date().getFullYear()}-${user.sroNumber}-${user.cerSequence}`;
                 mobileNumbers.forEach( mobileNo => {
					const mobileStr = String(mobileNo);
                    whatsAppNotificationForSMR({                        
                        templateId: templateId,
                        mobileNumber: mobileStr,
						docNo: docNumber,
                        regYear: date,
                        sroName: sroCode,
                        fileLink: user.applicationId+'-fromlink',
                    });
                })
			if(update.value === null){
				res.status(400).send({Success:false,data:null,message:`${process.env.BAD_REQUEST}`})
			} else{
			res.status(200).send({Success:true,data:update.value,message:`User Updated Successfully!!`})
			}
		} else {
			return res.status(400).send({Success: false, message: `${process.env.BAD_REQUEST}`})
		}
	}catch(ex){
	    logger.error('error :::',ex)
        res.status(500).send({Success:false,message:'Internal Server Problem'})
	}
}
/**
   * @api : /users/fileUpload/{id}/{fileName},
   * @apiType : PUT,
   * @api @param {id} is a unique Id of USER
   * @api @param {fileName} is a name of File like husbandSign,husbandPhoto
   * @apiDesc : Upload a file
   * @apiResponse : 200,Success Response
*/
const fileUpload = async(req,res) => {
    try {
		
        const reqParams = req.params;
		logger.info(`reqParams ::::: ${JSON.stringify(reqParams)}`)
		const [local, rest] = req.get("host").split(":");
		let Url =req.protocol + "://" + req.get("host") + "/uploads"

		const allowedFileNames = [
			"doc_husbandPhoto",
			"doc_wifePhoto",
			"doc_husbandSignature",
			"doc_wifeSignature"
		];
		const uploadedFile = req.files.image[0];
		if (allowedFileNames.includes(reqParams.fileName)) {
			fileUploadPath.copyToImageDir(req, uploadedFile);
		}

        let tempObj= {
            fileName:reqParams.fileName,
            filePath:req.files.image[0].path,
            downloadLink:req.files.image[0].mimetype === "application/pdf" ? `${Url}/${reqParams.id}/${reqParams.fileName}.pdf` :`${Url}/${reqParams.id}/${reqParams.fileName}.png`,
			timeStamp:new Date()
        }
		const query = {"_id": ObjectId(reqParams.id)}
		const findUserDocs = await helper.findOneMethod(sysConstants.Col_users,query);
		logger.info(`findUserDocs ::::: ${JSON.stringify(findUserDocs)}`)
		if(findUserDocs?.documents?.length === 0){
			const emUser = await userModel.findOneAndUpdate({ _id:ObjectId(reqParams.id),documents:{$nin:tempObj}},{$push:{documents:tempObj}});
			logger.info(`image upload ::::: ${emUser}`)
			// findUserDocs.documents.map((doc)=>{
			// })
			if(emUser){
				res.status(200).send({Success:true,message:`Image Uploaded Successfully!!`});
			}else{
				res.status(400).send({Success:false,message:`${process.env.BAD_REQUEST}`})
			}
		}else{
			const fileExist = findUserDocs?.documents ? await findUserDocs.documents.some(doc => doc.fileName === req.params.fileName) : null;
			logger.info(`fileExist ::::: ${fileExist}`)
			if(fileExist) {
				const fileData =await userModel.findOneAndUpdate
				(
					{
						_id:reqParams.id,
						documents:{$elemMatch:{fileName:{$eq: reqParams.fileName}}}
					},
					{
						$set:{"documents.$":tempObj}
					},
				);                      
				logger.info(`image upload ::::: ${fileData}`)                    
				if(fileData){
					// findUserDocs.documents.map((doc)=>{
					// 	console.log("RRRRRRRRRRRRRRRRRRRRR",doc.fileName)
					// })
					res.status(200).send({Success:true,message:`Image Uploaded Successfully!!`});
				}else{
					res.status(400).send({Success:false,message:`${process.env.BAD_REQUEST}`})
				}
			}else{
				const fileData =await userModel.findOneAndUpdate
				(
					{
						_id:reqParams.id,
						// documents:{$elemMatch:{fileName:{$ne: reqParams.fileName}}}
						$or: [
							{ documents: { $exists: false } },
							{ documents: { $not: { $elemMatch: { fileName: reqParams.fileName } } } }
						]
					},
					{
						$push:{"documents":tempObj}
					},
					{
						new:true
					}
				);
				logger.info(`image upload ::::: ${fileData}`)                    
				if(fileData){

					res.status(200).send({Success:true,message:`Image Uploaded Successfully!!`});
				}else{
					res.status(400).send({Success:false,message:`${process.env.BAD_REQUEST}`})
				}                      

			}
		}
    } catch (err) {
		logger.error('error :::',err)                     
        res.status(500).send({Success:false,message:'Internal Server Problem'})
    }
};
/**
   * @api : /users/forgetPassword,
   * @apiType : PUT,
   * @apiDesc : forgetPassword
   * @apiResponse : 200,Success Response
*/

const forgotPassword = async (req,res) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp-mail.outlook.com",
            port: 587,
            //secure: false,
            ssl:true,
            auth: {
				user: `${process.env.SMTP_EMAIL}`,
				pass: `${process.env.SMTP_PASSWORD}`
            },
        });
		logger.info(`transporter ::::: ${transporter}`)                    
		const reqBody = req.body;
		const useridentify = {loginEmail:req.body.loginEmail}
        const findUser = await helper.findOneMethod(sysConstants.Col_users,useridentify);
		logger.info(`findUser ::::: ${findUser}`)                 
		if(findUser == undefined){
			return res.status(404).send({Success:false,message:`Email ID Not Found`})
		}
		let query;
		let identify;
		const otpUserIdentify  = {"loginEmail":req.body.loginEmail,otpType:"forgetOtp"};
		let otpUser = await otpModel.findOne(otpUserIdentify);
		logger.info(`otpUser ::::: ${otpUser}`)                     
		let otp = Math.floor(1000 + Math.random() * 9000);
		if(otpUser){
			identify =otpUserIdentify;
			let countdown = otpUser.sendCount -1;
			query = {otp:String(otp),status:true,otpType:'forgetOtp',validateCount:5,isValidate:false,sendCount:countdown};
			if( otpUser.sendCount <= 0){
				if(((new Date().getTime() - new Date(otpUser.updatedAt).getTime()) / (1000*60*60)) >= 1){
					identify =  {"loginEmail":req.body.loginEmail};
					query ={sendCount:5};
				}else{
					return res.status(400).send({message:"You have exceeded OTP request.Try after one hour"})
				}
			}

		}else{
			identify ={loginEmail:req.body.loginEmail}
			query = {otp:String(otp),status:true,otpType:'forgetOtp',validateCount:5,isValidate:false,sendCount:5};
		}
		var info = await transporter.sendMail({
				from: '"IGRS" <support.igrs@criticalriver.com>', // sender address
				to: reqBody.loginEmail, // list of receivers
				subject: "forgot password", // Subject line
				text: `Hi ${findUser.loginName},`+'\n'+`Please reset Your Password using this OTP - ${otp}`+'\n'+'\n'+`Thanks`+'\n'+`IGRS -AP`, // plain text body
				// html: `<b>OTP to verify the email ${otp} </b>`

        });
		logger.info(`info ::::: ${info}`)                   
		await otpModel.findOneAndUpdate(identify,query,{upsert:true});
		
		console.log("mail sent id",info);
		return res.status(200).send({Success:true,message:"OTP Sent to Your Email Successfully!!"})
		
    } catch (err) {
		logger.error('error :::',err)                     
        res.status(500).send({Success:false,message:'Internal Server Problem'})
    }
};
/**
   * @api : /users/resetPassword,
   * @apiType : PUT,
   * @apiDesc : resetPassword
   * @apiResponse : 200,Success Response
*/
const resetPassword = async(req,res) => {
    try {
		const reqBody = req.body;
		logger.info(`reqBody ::::: ${JSON.stringify(reqBody)}`)                    
		if(!passwordPattern.test(reqBody.loginPassword)){
			return res.status(400).send({Success:false,message:'Password should meet the password policy.!'});
		}
		if(reqBody?.loginEmail == null || reqBody?.loginPassword == null){
			return res.status(400).send({Success:false,message:'Email Id/Password Incorrect'});
		}
		const identify = {loginEmail:reqBody.loginEmail,isValidate:true};
		const findUser = await helper.findOneMethod(sysConstants.Col_otp,identify);
		logger.info(`findUser ::::: ${findUser}`)                  
		if(findUser == undefined){
			return res.status(400).send({Success:false,message:`Email Should be Validated`})
		}else{
			const query ={loginPassword:reqBody.loginPassword};
			const identify2 ={loginEmail:reqBody.loginEmail};
			const setPassword = await helper.fAndUpdateMethod(sysConstants.Col_users,identify2,query);
			logger.info(`setPassword ::::: ${setPassword}`)                     
			let query2 ={isValidate:false}
			if(setPassword?.value !== null){
				await helper.fAndUpdateMethod(sysConstants.Col_otp,identify2,query2);
				return res.status(200).send({Success:true,message:`Password Changed Succesfully`})
			}
		}
    } catch (err) {
		logger.error('error :::',err)                     
        res.status(500).send({Success:false,message:'Internal Server Problem'})}
};

/**
   * @api : /users/all/:sroOffice,
   * @apiType : GET,
   * @api @param {sroOffice} is a Name of Town/City
   * @apiDesc : Get All the Users Who are registered under a Particular SRO
   * @apiResponse : 200,Success Response
*/

const getUsersBySro = async (req,res,next)=>{
	
	const reqParams = req.params;
	const reqQuery = req.query;
	logger.info(`reqParams ::::: ${JSON.stringify(reqParams)}`)
	logger.info(`reqQuery ::::: ${JSON.stringify(reqQuery)}`)                                       
	if(reqParams.sroCode == null){
		res.status(404).send({Success:false,message:`sroCode is Required`})
	};
	let query = {"sroNumber" : parseInt(reqParams.sroCode)}
	let sroDetails  = await helper.findOneMethod(sysConstants.Col_Officers,query);
	logger.info(`sroDetails ::::: ${sroDetails}`)                                        
	try{
		let userQury;
		
		if((reqQuery?.status == undefined || reqQuery?.status == "") && reqQuery.issetToNotice == undefined){
			userQury = {sroDistrict:sroDetails.sroDistrict,sroOffice:sroDetails.sroOffice.toUpperCase()};
		}else if(reqQuery?.status == undefined || reqQuery?.status == ""){
			reqQuery.issetToNotice = reqQuery.issetToNotice =="true" ? true :false;
			userQury = {sroDistrict:sroDetails.sroDistrict,sroOffice:sroDetails.sroOffice.toUpperCase(),issetToNotice:reqQuery.issetToNotice};
		}
		else{
			reqQuery.issetToNotice = reqQuery.issetToNotice =="true" ? true :false;
			userQury = {sroDistrict:sroDetails.sroDistrict,sroOffice:sroDetails.sroOffice.toUpperCase(),issetToNotice:reqQuery.issetToNotice,status:reqQuery?.status};
		}
		if(reqQuery.year) {
			userQury.regDate = {
				$gte: new Date(`${reqQuery.year}-01-01T00:00:00Z`),
				$lte: new Date(`${reqQuery.year}-12-31T23:59:59Z`)
			}
		}
		const Users = await SortAndPaginator(req,next,userModel,userQury);
		logger.info(`Users ::::: ${Users}`)                                    
		// await userModel.aggregate([userQury]).count
		let fObj =[];
		Users.list.map((user)=>{
			
			const Obj ={
				applicationId :user.applicationId,
				groomName : user.husbandName,
				brideName : user.wifeName,
				mrgType : user.mrgType,
				regDate : user.regDate,
				slotTime : user.slotTime,
				status : user.status,
				issetToNotice:user.issetToNotice,
				sroOffice : user.sroOffice,
				noticeEndDate:user.noticeEndDate

			};
			if(user.status =="PENDING"){
				Obj.slotDate = user.slotDate
			}else{
				Obj.actionDate = user.actionDate
			}
			// let currentDate = new Date()
			const currentDate = new Date(); currentDate.setDate(currentDate.getDate() -1);
			if(user.slotDate != undefined && reqQuery.issetToNotice == true && reqQuery.status == "PENDING"){
				
				
				// as we are storing date in timestamp, we can do this operattion directly
				if(Obj.noticeEndDate && (new Date(Obj.noticeEndDate) <= currentDate)){
					if(Obj.mrgType != "" && Obj.regDate !== null){
						fObj = [...fObj,Obj];
					}
				}

				//I have added this logic for temporarily
				// let [date,time] =  Obj.noticeEndDate.split(",")
				// let [timeHr,timeMIn] = String(time).split(":");
				// if(currentDate.getHours >=timeHr){
				// 	if(currentDate.getMinutes >= timeMIn){
				// 		if(Obj.mrgType != "" && Obj.regDate !== null){
				// 			fObj = [...fObj,Obj];
				// 		}
				// 	}
				// }
			}else{
				if(Obj.mrgType != "" && Obj.regDate !== null){
					fObj = [...fObj,Obj];
				}
			}
		});
		Users.list = fObj;
		return res.status(200).send({
			Success:true,
			data:Users
		})

	}catch(ex){
		logger.error('error :::',ex)                                         
        res.status(500).send({Success:false,message:'Internal Server Problem'})
	}
}


const generateDocumentId =async (sroCode)=> {
	return "APSPL" + new Date().getFullYear() + "" +sroCode+ Math.round(new Date()/1);
	// Math.round(+new Date()/1000);
	//return like AP2021874687
}
/**
   * @api users/:applicationId,
   * @apiType : GET,
   * @api @param {applicationId} is a UniqueID
   * @apiDesc : Get a Particular User Details
   * @apiResponse : 200,Success Response
*/
const getUserByAppNo = async (req,res)=>{
	const reqParams = req.params;
	logger.info(`reqParams ::::: ${JSON.stringify(reqParams)}`)                                        
	if(reqParams.applicationId == null){
		res.status(404).send({Success:false,message:`ApplicationId is Required`})
	}
	try{
		let query = {applicationId:reqParams.applicationId};
		const user = await userModel.findOne(query);
		logger.info(`user data ::::: ${user}`)                                       
		if (user?.husbandeSignAadhar && user.husbandeSignAadhar.length > 12) {
			try {
				user.husbandeSignAadhar = gToken.decryptData(user.husbandeSignAadhar);
			} catch (err) {
				logger.error("Husband eSign Aadhaar decryption failed:", err);
				console.log("Husband eSign Aadhaar decryption failed:", err);
			}
		} 
		if (user?.wifeeSignAadhar && user.wifeeSignAadhar.length > 12) {
			try {
				user.wifeeSignAadhar = gToken.decryptData(user.wifeeSignAadhar);
			} catch (err) {
				logger.error("Wife eSign Aadhaar decryption failed:", err);
				console.log("Wife eSign Aadhaar decryption failed:", err);
			}
		} 
		if (user?.witness1Aadhar && user.witness1Aadhar.length > 12) {
			try {
				user.witness1Aadhar = gToken.decryptData(user.witness1Aadhar);
			} catch (err) {
				logger.error("Witness1 eSign Aadhaar decryption failed:", err);
				console.log("Witness1 eSign Aadhaar decryption failed:", err);
			}
		} 
		if (user?.witness2Aadhar && user.witness2Aadhar.length > 12) {
			try {
				user.witness2Aadhar = gToken.decryptData(user.witness2Aadhar);
			} catch (err) {
				logger.error("Witness2 eSign Aadhaar decryption failed:", err);
				console.log("Witness2 eSign Aadhaar decryption failed:", err);
			}
		} 
		if (user?.witness3Aadhar && user.witness3Aadhar.length > 12) {
			try {
				user.witness3Aadhar = gToken.decryptData(user.witness3Aadhar);
			} catch (err) {
				logger.error("Witness3 eSign Aadhaar decryption failed:", err);
				console.log("Witness3 eSign Aadhaar decryption failed:", err);
			}
		} 
		if (user?.sroAadhar && user.sroAadhar.length > 12) {
			try {
				user.sroAadhar = gToken.decryptData(user.sroAadhar);
			} catch (err) {
				logger.error("Sro eSign Aadhaar decryption failed:", err);
				console.log("Sro eSign Aadhaar decryption failed:", err);
			}
		}    
		if(user == null){
			res.status(404).send({Success:false,message:`User Not Exist with this ApplicationId ${reqParams.applicationId}`})
		}else{
			return res.status(200).send({Success:true,data:user})
		}
	}catch(ex){
		logger.error('error :::',ex)                                         
        res.status(500).send({Success:false,message:'Internal Server Problem'})
	}
}

const getSroNumber = async(req, res) => {
	const reqParams = req.params;
	logger.info(`reqParams ::::: ${JSON.stringify(reqParams)}`)                                        
	if(!reqParams.district || !reqParams.sroOffice){
		res.status(400).send({status: false, message: "Bad Request"});
	} 
	try {
		let query = {'sroDistrict': reqParams.district, 'sroOffice': reqParams.sroOffice};
		const officer = await officerModel.findOne(query);
		console.log(officer)
		logger.info(`officer data ::::: ${officer}`)
		if(officer){
			res.status(200).send({status: true, message: "", sroNumber: officer.sroNumber});
		} else {
			res.status(404).send({status: false, message: 'SRO Number not found'});
		}

	} catch (err){
		logger.error('error :::',err)                                         
		res.status(500).send({status: false, message: "Internal Server Problem"});
	}
}

const refreshToken = async (req,res)=>{
	try{
			const reqParams = req.params;
			let tokenHeader = req.headers['authorization']
			if (tokenHeader) {
				let token = await tokenHeader.split(" ");
	
				let decoded = jwt.decode(token[1], process.env.JWT_SECRET_KEY);
				console.log(" decoded :: ", decoded);
				logger.info(`decoded ::::: ${decoded}`)
				if (decoded) {
					let loginTypeVal = (decoded.loginType);
					let currentTime = (new Date().getTime())/1000;
	
					let expiredVal = decoded.exp;
					const expiresIn = parseInt(process.env.JWT_RESET_EXP_IN.replace("h",""));
					expiredVal = expiredVal+expiresIn*60*60;
					if(expiredVal < currentTime)
						return res.status(400).json({ success: false, error: `${process.env.BAD_REQUEST}` });
					else
					{
						delete decoded.exp;
						delete decoded.iat;
						let tokenUrl = req.protocol + "://" + req.get("host") + "/smr/token/";
						const token = await gToken.createToken(decoded, tokenUrl);
						logger.info(`token ::::: ${JSON.stringify(token)}`)
						return res.status(200).send(
						{	success:true,
							data:token
						}
						);
					}
				}else {
					return res.status(400).json({ success: false, error: `${process.env.BAD_REQUEST}` })
				}
			} else {
				return res.status(400).json({ success: false, error: `${process.env.BAD_REQUEST}` })
			}
	
	}catch(ex){
		logger.error("error :::",ex)
        res.status(500).send({Success:false,message:'Internal Server Problem'})
	}

}

const getUserInfo = async (user)=>{
    let userInfo= {
        _id:user._id,
		loginId:user._id,
        loginEmail: user.loginEmail,
		loginName:user.loginName,
		loginMobile: user.loginMobile,
		loginType:user.loginType,
		lastLogin:user.lastLogin,
		status:user.status,
		marriageType:user.mrgType,
		sroDistrict :user.sroDistrict,
		sroOffice :user.sroOffice,
		sroNumber: user.sroNumber,
		applicationId:user.applicationId
    }
    return userInfo;
};




const ScheduleJob =async (req,res) =>{
	try{
		let userData = await userModel.aggregate([{$match:{"status":"PENDING", issetToNotice: true}}]);
		logger.info(`userData ::::: ${JSON.stringify(userData)}`)
		 for(let i in userData){
			// let noticeendarr ="";
			// if(userData[i].noticeEndDate && typeof(userData[i].noticeEndDate) == "string" && userData[i].noticeEndDate.includes('/')){
					// noticeendarr = userData[i].noticeEndDate.split("/");
					// let x = noticeendarr[0];
					// noticeendarr[0] = noticeendarr[2].substring(0,4);
					// noticeendarr[2] = x;
					// noticeendarr = noticeendarr.join('/');
			// }
			if(userData[i].noticeEndDate){
				const Difference_In_Time = new Date().getTime() - new Date(userData[i].noticeEndDate).getTime();
				const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
				if(parseInt(Difference_In_Days) > 90){
					await userExpired(userData[i])
				}
			}
		}
	}catch(ex){
		logger.error("Schedule Job ::",ex.message);
		console.log("Schedule Job ::",ex.message)
	}
}

 async function userExpired(userdata){
	let actionDate = new Date()
	let expire = await userModel.findOneAndUpdate({_id:userdata._id},{$set:{status:"EXPIRED",actionDate:actionDate}});
	let transporter = nodemailer.createTransport({
		host: "smtp-mail.outlook.com",
		// smtp.office365.com
		port: 587,
		//secure: false,
		ssl:true,
		auth: {
			user: `${process.env.SMTP_EMAIL}`,
			pass: `${process.env.SMTP_PASSWORD}`
		},
	});

	const info = await transporter.sendMail({
		from: '"IGRS" <support.igrs@criticalriver.com>', // sender address
		to: userdata.loginEmail, // list of receivers
		subject: "Slot Date Expired", // Subject line
		text: `Hi ${userdata.husbandName}, ${userdata.wifeName} `+'\n'+'Your Slot Date has expired.'+
		'Please Book your slot again.'+'\n'+'\n'+ 'Thanks,'+'\n'+'IGRS-AP', // plain text body
		// html: `<b>Hi, ${userdata.husbandName}, ${userdata.wifeName} </b>`+'\n'+'Your Slot Date has expired.'+
		// 'Please Book your slot again.'+'\n'+'\n'+ 'Thanks,'+'\n'+'<b>Special Marriage Registration - IGRS-AP GOVT.</b>'
	});
	console.log("mail sent id",info);
	logger.info(`mail sent id ::::: ${info}`)
}

// @desc saving registration details as draft until final submit
// Method: PUT
// route: users/saveDraft/:id
const saveDraft = async (req, res) => {
	try {
		const id = req.params.id;
		logger.info(`id ::::: ${id}`)                                        
		const user = await userModel.findOne({_id: ObjectId(id)});
		logger.info(`user data ::::: ${user}`)                                         

		if(user && (!user.status || user.status === "DRAFT")){
			let body = {...req.body};
			['husbandDateofBirth','husbandDivorceDate', 'wifeDateofBirth', 'wifeDivorceDate', 'slotDate', 'regDate', 'marriageDate', 'wifeLengthofResidence', 'husbandLengthofResidence'].forEach(o => {
				if(body[o]){
					body[o] = new Date(`${body[o]}T00:00:00Z`);
				}
			})
			const updatedUser = await userModel.findOneAndUpdate({_id: ObjectId(id)}, {$set: {...body, status: "DRAFT"}}, {returnOriginal: false});
			logger.info(`updatedUser ::::: ${updatedUser}`)                                         
			if(updatedUser){
				res.status(200).json({'message': "Draft Saved Successfully"})
			} else {
				res.status(400).json({'message': `${process.env.BAD_REQUEST}`});
			}

		} else {
			res.status(404).json({'message': "Registration details not found"})
		}
	} catch (err) {
		logger.error('error :::',err)                                         
		res.status(500).json({message: "Internal Server Problem"});
	}
}

// @desc getting Registration Draft Details
// Method: GET
// route: users/draft/:id
const getUserDraft = async (req, res) => {
	try{
		const id = req.params.id;
		logger.info(`id ::::: ${id}`)                                        
		if(id){
			const user = await userModel.findOne({_id: ObjectId(id)}, {actionDate: 0, cert_form: 0, cert_url: 0, createdAt: 0, issetToNotice: 0, lastLogin: 0, loginAttemptsLeft: 0, loginBlockedUntil: 0, loginEmail: 0, loginId: 0, loginKey: 0, loginMobile: 0, loginName: 0, loginType: 0, noticeEndDate: 0, noticeStartDate: 0, reasonForRejection: 0, seqenceNum: 0, slotDate: 0, updatedAt: 0, __v: 0, _id: 0});
			logger.info(`user ::::: ${user}`)                                       
			if(user){
				res.status(200).json({message: "Registration Details Fetched Successfully", data: user})
			} else {
				res.status(404).json({'message': "Registration Details Not Found"})
			}
		} else {
			res.status(400).json({'message': `${process.env.BAD_REQUEST}`})
		}
	} catch(err) {
		logger.error('user :::',err)                                         
		res.status(500).json({message: "Internal Server Problem"});
	}
}


const resetSROSequenceNumbers =  async ()=> {
    let responseJson = {};
    console.log("Inside of resetSROSequenceNumbers ::: ");
    try {
        let sequenceUpdatedData = await sequenceModel.updateMany({sequence:0,cer_sequence:0});
		logger.info(`sequenceUpdatedData ::::: ${sequenceUpdatedData}`)                                         
        if(sequenceUpdatedData.acknowledged)
        {
            responseJson["message"] = "Old sequence numbers deleted successfully.";
            responseJson["status"] = "Success";
            responseJson["modifiedCount"] = sequenceUpdatedData.modifiedCount;
        }
       else
       {
        responseJson["status"] = "Failure";
        responseJson["response"] = sequenceUpdatedData;
       }
    } catch (error) {
        responseJson["message"] = error.message;
        responseJson["status"] = "Failure";
		logger.error("Error in resetSROSequenceNumbers ::: ", error);
        console.log("Error in resetSROSequenceNumbers ::: ", error);
    }
    console.log("End of resetSROSequenceNumbers ::: ");
    return responseJson;
};

const checkAndDeleteFolderForUsers = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const users = await userModel.find({});
        const deletedUserIds = [];

        for (const user of users) {
            if (user.noticeEndDate) {
                const noticeEndDatePlus10 = new Date(user.noticeEndDate);
                noticeEndDatePlus10.setDate(noticeEndDatePlus10.getDate() + 10);
                noticeEndDatePlus10.setHours(0, 0, 0, 0);

                const todayDateString = today.toISOString().split('T')[0];
                const noticeDateString = noticeEndDatePlus10.toISOString().split('T')[0];

                if (todayDateString <= noticeDateString) {
                    const folderPath = path.join(__dirname, `../../../public/uploads/${user._id}`);

                    if (fs.existsSync(folderPath)) {
                        fs.rmSync(folderPath, { recursive: true, force: true });
                        deletedUserIds.push(user._id.toString());
                    }
                }
            }
        }

        if (deletedUserIds.length > 0) {
            console.log(`Folders deleted for user IDs: ${deletedUserIds.join(', ')}`);
			logger.info(`Folders deleted for user IDs: ${deletedUserIds.join(', ')}`);
        } else {
            console.log("No folders deleted today.");
			logger.info("No folders deleted today.");
        }

    } catch (error) {
		logger.error("Error during folder deletion process:", error);
        console.error("Error during folder deletion process:", error);
    }
}

const GetRevenueDetailsofSMR = async (req,res) => {
	try {
		let srnumber = parseInt(req.query.sroNumber);
		let startdate = new Date(req.query.startdate);
		let enddate = new Date(req.query.enddate);

		const query = {
			cert_form: true,
			sroNumber: srnumber,
			updatedAt: { $gte: startdate, $lte: enddate }
		};

		let userRegData = await userModel.find(query);
		logger.info(`userRegData ::::: ${userRegData}`)

		if (!userRegData) {
			res.status(404).json({'message': "Registration Details Not Found"})
		} else {
			let resultArray = userRegData.map(data => ({
				appNo: data.applicationId,
				cert_url:data.cert_url,
				cert_form:data.cert_form,
				updatedAt:data.updatedAt
			}));
			res.status(200).json({message: "Registration Details Fetched Successfully", data: resultArray})
		}
	} catch (err) {
		logger.error('error :::',err)
		res.status(500).json({message: "Internal Server Problem"});
	}
};

const GetMisReportsSMR = async (req, res) => {
    try {
        const { startdate, enddate, type } = req.query;

        if (!startdate || !enddate) {
            return res.status(400).json({ message: "Start date and End date are required" });
        }

        const startDateObj = new Date(startdate);
        const endDateObj = new Date(enddate);

        if (isNaN(startDateObj) || isNaN(endDateObj)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        if (!type || (type !== "district" && type !== "sro")) {
            return res.status(400).json({ message: "Invalid or missing 'type' parameter. Allowed values: 'district', 'sro'" });
        }

        let matchStage = {
            cert_form: true,
            createdAt: { $gte: startDateObj, $lte: endDateObj }
        };

        let groupByFields = {};
        if (type === "district") {
            groupByFields = { sroDistrict: "$sroDistrict" };
        } else if (type === "sro") {
            groupByFields = { sroDistrict: "$sroDistrict", sroOffice: "$sroOffice" };
        }

        let aggregatedData = await userModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: groupByFields,
                    count: { $sum: 1 },
                    totalAmount: { $sum: 200 }
                }
            },
            { $sort: { "_id.sroDistrict": 1 } }
        ]);
		logger.info(`aggregatedData ::::: ${aggregatedData}`)

        if (!aggregatedData || aggregatedData.length === 0) {
            return res.status(404).json({ message: "No records found", data: [] });
        }

        res.status(200).json({ message: "Registration Details Fetched Successfully", data: aggregatedData });

    } catch (err) {
		logger.error('error :::',err)
        console.error("Error fetching MIS reports:", err);
        res.status(500).json({ message: "Internal Server Problem", error: err.message });
    }
};

const GetMisReportsByDistrict = async (req, res) => {
    try {
        const { startdate, enddate, district } = req.query;

        if (!startdate || !enddate) {
            return res.status(400).json({ message: "Start date and End date are required" });
        }

        if (!district) {
            return res.status(400).json({ message: "District parameter is required" });
        }

        const startDateObj = new Date(startdate);
        const endDateObj = new Date(enddate);

        if (isNaN(startDateObj) || isNaN(endDateObj)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        let matchStage = {
            cert_form: true,
            createdAt: { $gte: startDateObj, $lte: endDateObj },
            sroDistrict: district
        };

        let aggregatedData = await userModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: { sroOffice: "$sroOffice" },
                    count: { $sum: 1 },
                    totalAmount: { $sum: 200 }
                }
            },
            { $sort: { "_id.sroOffice": 1 } }
        ]);

		logger.info(`aggregatedData ::::: ${aggregatedData}`)
        if (!aggregatedData || aggregatedData.length === 0) {
            return res.status(404).json({ message: "No records found", data: [] });
        }

        res.status(200).json({ message: "Registration Details Fetched Successfully", data: aggregatedData });

    } catch (err) {
	    logger.error("Error ::", err);
        console.error("Error fetching MIS reports:", err);
        res.status(500).json({ message: "Internal Server Problem", error: err.message });
    }
};

	const GetSmrDataForRtgs = async (req, res) => {
	try {
		const { startdate, enddate } = req.query;

		if (!startdate || !enddate) {
			return res.status(400).json({ message: "Start date and End date are required" });
		}

		const startDateMoment = moment(startdate, 'DD-MM-YYYY', true);
		const endDateMoment = moment(enddate, 'DD-MM-YYYY', true);

		if (!startDateMoment.isValid() || !endDateMoment.isValid()) {
			return res.status(400).json({ message: "Invalid date format. Use DD-MM-YYYY" });
		}

		if (endDateMoment.isBefore(startDateMoment)) {
			return res.status(400).json({ message: "End date should be equal to or after Start date" });
		}

		const startDateObj = startDateMoment.toDate();
		const endDateObj = endDateMoment.endOf('day').toDate();

		const matchStage = {
			cert_form: true,
			createdAt: { $gte: startDateObj, $lte: endDateObj },
			status: { $in: ["ACCEPTED", "REJECTED"] }
		};

		const records = await userModel.find(matchStage).sort({ createdAt: -1 });
		logger.info(`user Data ::::: ${records}`)

		if (!records || records.length === 0) {
			return res.status(404).json({ message: "No data found", data: [] });
		}

		const filteredRecords = records.map(record => ({
			husbandName: record.husbandName,
			husbandCaste: record.husbandCaste,
			husbandReligion: record.husbandReligion,
			husbandDateofBirth: record.husbandDateofBirth,
			husbandMarriageAge: record.husbandMarriageAge,
			husbandCountry: record.husbandCountry,
			husbandState: record.husbandState,
			husbandAddress: record.husbandAddress,
			husbandPermanentAddress: record.husbandPermanentAddress,
			husbandFatherName: record.husbandFatherName,
			husbandMotherName: record.husbandMotherName,
			husbandMobile: record.husbandMobile,
			husbandDistrict: record.husbandDistrict,
			husbandMandal: record.husbandMandal,
			husbandSroOffice: record.husbandSroOffice,

			wifeName: record.wifeName,
			wifeCaste: record.wifeCaste,
			wifeReligion: record.wifeReligion,
			wifeDateofBirth: record.wifeDateofBirth,
			wifeMarriageAge: record.wifeMarriageAge,
			wifeCountry: record.wifeCountry,
			wifeState: record.wifeState,
			wifeAddress: record.wifeAddress,
			wifePermanentAddress: record.wifePermanentAddress,
			wifeFatherName: record.wifeFatherName,
			wifeMotherName: record.wifeMotherName,
			wifeMobile: record.wifeMobile,
			wifeDistrict: record.wifeDistrict,
			wifeMandal: record.wifeMandal,
			wifeSroOffice: record.wifeSroOffice,

			status: record.status,
			mrgType: record.mrgType,
			sroDistrict: record.sroDistrict,
			sroMandal: record.sroMandal,
			sroOffice: record.sroOffice,
			regDate: record.regDate,
			placeOfMarriage: record.placeOfMarriage,
			marriedAddress: record.marriedAddress,
			applicationId: record.applicationId,
			sroNumber: record.sroNumber
		}));

		res.status(200).json({ message: "Data fetched successfully", data: filteredRecords });

	} catch (err) {
	    logger.error("Error ::", err);
		console.error("Error fetching data:", err);
		res.status(500).json({ message: "Internal Server Error", error: err.message });
	}
};

const GetSmrStatisticsForRtgs = async (req, res) => {
	try {
		const { startdate, enddate } = req.query;

		if (!startdate || !enddate) {
			return res.status(400).json({
				message: !startdate ? "Start date is required" : "End date is required",
			});
		}

		const startDateMoment = moment(startdate, 'DD-MM-YYYY', true);
		const endDateMoment = moment(enddate, 'DD-MM-YYYY', true);

		if (!startDateMoment.isValid() || !endDateMoment.isValid()) {
			return res.status(400).json({
				message: "Date format must be DD-MM-YYYY",
			});
		}

		if (endDateMoment.isBefore(startDateMoment)) {
			return res.status(400).json({
				message: "End date should be equal to or after Start date",
			});
		}

		const startDateObj = startDateMoment.toDate();
		const endDateObj = endDateMoment.endOf('day').toDate();

		const query = {
			createdAt: { $gte: startDateObj, $lte: endDateObj },
		};

		const data = await userModel.aggregate([
			{ 
				$match: { 
					createdAt: { $gte: startDateObj, $lte: endDateObj },
					sroDistrict: { $ne: null, $ne: "" },
					sroOffice: { $ne: null, $ne: "" },
					status:{ $ne: null, $ne: "" }
				}
			},
			{
				$project: {
					sroDistrict: 1,
					sroOffice: 1,
					status: 1,
					opening: {
						$cond: [{ $eq: ["$status", "PENDING"] }, 1, 0]
					},
					closed: {
						$cond: [{ $in: ["$status", ["ACCEPTED", "REJECTED"]] }, 1, 0]
					}
				}
			},
			{
				$group: {
					_id: {
						district: "$sroDistrict",
						sroOffice: "$sroOffice"
					},
					openingCount: { $sum: "$opening" },
					closedCount: { $sum: "$closed" }
				}
			},
			{
				$addFields: {
					totalCount: { $add: ["$openingCount", "$closedCount"] }
				}
			},
			{
				$match: {
					totalCount: { $gt: 0 },
					"_id.district": { $exists: true, $nin: [null, ""] },
					"_id.sroOffice": { $exists: true, $nin: [null, ""] }
				}
			},
			{
				$project: {
					_id: 0,
					district: "$_id.district",
					sroOffice: "$_id.sroOffice",
					openingCount: 1,
					closedCount: 1,
					totalCount: 1
				}
			},
			{
				$sort: {
					district: 1,
					sroOffice: 1
				}
			}
		]);		

		logger.info(`user Data ::::: ${data}`)			
		res.status(200).json({
			message: "Data fetched successfully",
			data: data
		});
	} catch (err) {
		logger.error("Error ::", err);
		console.error("Error fetching data:", err);
		res.status(500).json({
			message: "Internal Server Error",
			error: err.message
		});
	}
};

module.exports = {emailVerification,otpValidate,singup,login,saveUser,fileUpload,forgotPassword,resetPassword,getUsersBySro,getUserByAppNo,refreshToken,ScheduleJob,statusUpdate, getSroNumber, saveDraft, getUserDraft,resetSROSequenceNumbers,GetRevenueDetailsofSMR,GetMisReportsSMR,GetMisReportsByDistrict,GetSmrDataForRtgs,checkAndDeleteFolderForUsers,GetSmrStatisticsForRtgs}