const userModel = require('../../models/users.model');
const jwt = require('../../services/auth.service');
const dbHelper = require('../../utils/helper');
const sysConstants = require('../../utils/sysConstanst');
const officerModel = require('../../models/officer.model');
const gToken = require('../../services/auth.service');
const sequenceModel = require('../../models/sequence');
const moment = require('moment');
const usersModel = require('../../models/users.model');
const { ObjectId } = require('mongodb');
const {userValidations} = require('../../utils/validation');
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[a-zA-Z\d@$!%*#?&]{8,}$/;
const masterDataModel = require('../../models/masterData.model');
const logger = require('../../config/winston');

exports.getUser = (data) => {
    try {
        return new Promise(function (resolve, reject) {
            userModel.find()
                .then(response => resolve(response))
                .catch(err => reject(err));
        });
    } catch (err) {
		logger.error("process error" + err.message);
        console.log("process error" + err.message);
    }
};

/**
   * @api : /officer/signup,
   * @apiType : POST,
   * @apiDesc : Signup for officer
   * @apiResponse : 200,Success Response
*/
const signUp =async (req,res) => {
	const reqBody = req.body;
	logger.info(`reqBody ::::: ${JSON.stringify(reqBody)}`)                                                                                                                                                                                     
	if(reqBody.loginEmail == null || reqBody.loginMobile == null || reqBody.loginPassword == null || reqBody.sroDistrict  == null || reqBody.sroOffice == null){
		console.log("")
		res.status(404).send({Success:false,message:"Validation Error"})
	}
	let userExist = await officerModel.findOne({loginEmail:reqBody.loginEmail});
	logger.info(`userExist ::::: ${userExist}`)                                        
	if(userExist){
		res.status(400).send({Success:false,message:"User Exists"})
	}
    try {
		let response;
		let filters={
			srName : reqBody.sroOffice.toUpperCase()
		}
		const sroDetails = await  dbHelper.findOneMethod(sysConstants.Col_masterData_Sro,filters);
		logger.info(`sroDetails ::::: ${sroDetails}`)                                       
		if(sroDetails == undefined){
			if(reqBody.sroNumber ==  null){
				res.status(400).send({Success:false,message:"Sro Office Number is Missing"});
			}else{
				let newOfficer = new officerModel(reqBody)
				response =await newOfficer.save()
			}
		}else{
			reqBody.sroNumber = sroDetails.srCode
			let newOfficer = new officerModel(reqBody)
			response =await  newOfficer.save()
		}
		logger.info(`response ::::: ${response}`)                                        
		res.status(200).send({Success:true,message:'Officer Created Successfully', data:response})
    } catch (err) {
		logger.error('error :::',err)                                         
		res.status(500).send({Success:false,message:'Internal Server Problem'})
    }
};

/**
   * @api : /officer/login,
   * @apiType : POST,
   * @apiDesc : login for Officer
   * @apiResponse : 200,Success Response
*/
const login = async (req,res) =>{
	const reqBody = req.body;
	logger.info(`reqBody ::::: ${JSON.stringify(reqBody)}`)                                        
	if(reqBody.loginEmail == null || reqBody.loginPassword == null){
		res.status(404).send({success:false,message:"Validation Error"})
	}
	let query = {
		loginEmail : {'$regex': `^${reqBody.loginEmail}$`, '$options' : 'i'} ,loginPassword:reqBody.loginPassword
	};
	let query2 = {loginEmail : {'$regex': `^${reqBody.loginEmail}$` , '$options' : 'i'}};
	let date = new Date();
	var dateStr =
	("00" + date.getDate()).slice(-2) + "-" +
	("00" + (date.getMonth() + 1)).slice(-2) + "-" +
	date.getFullYear() + " " +
	("00" + date.getHours()).slice(-2) + ":" +
	("00" + date.getMinutes()).slice(-2) + ":" +
	("00" + date.getSeconds()).slice(-2);

	let lastLogin=dateStr;
	let loginUser = await officerModel.findOne(query2);
	logger.info(`loginUser ::::: ${loginUser}`)                                        
	if(!loginUser){
		return res.status(404).send({success:false, message:"Officer Not Found"})
	} else if(loginUser.loginPassword !== reqBody.loginPassword){
		return res.status(400).send({success: false, message: "Invalid Email ID/ Password"})
	} else {
		try{
			// const [local, rest] = req.get("host").split(":");
			// let tokenUrl  = local === "localhost"
			// ? req.protocol + "://" + req.get("host") + "/smr/token/"+loginUser._id
			// : "https://" + req.get("host") + "/smr/token/"+loginUser._id;
			await officerModel.findOneAndUpdate(query,{$set:{lastLogin:lastLogin}});
			let tokenUrl = req.protocol + "://" + req.get("host") + "/smr/token/";
			const officerDetails = await getUserInfo(loginUser);
			logger.info(`officerDetails ::::: ${officerDetails}`)                                         
			officerDetails.token = await gToken.createToken(officerDetails,tokenUrl);
			return res.status(200).send(
				{	success:true,
					data:officerDetails
				}
			)
	
		}catch(ex){
			logger.error('error :::',ex)                                         
			res.status(500).send({success: false,message:'Internal Server Problem'})
		}
	}
};

const getUserInfo = async (officer)=>{
    const userInfo= {
		_id: officer._id,
		loginId:officer._id,
        loginEmail: officer.loginEmail,
		loginName:officer.loginName,
		loginType:officer.loginType,
		loginMobile: officer.loginMobile,
		sroDistrict:officer.sroDistrict,
		sroOffice:officer.sroOffice,
		villageName:officer.villageName,
		villageCode:officer.villageCode,
		vswsName:officer.villageScretariatName,
		vswsCode:officer.villageScretariatCode,
		lastLogin:officer.lastLogin,
		sroNumber:officer.sroNumber,
		role: officer.role
    }
    return userInfo;
};
/**
   * @api : /officer/notice/{applicationId},
   * @apiType : put,
   * @api @param {applicationId} is a unique id for USER,
   * @apiDesc : USER will be set to be on noticeBoard
   * @apiResponse : 200,Success Response
*/
const updateNoticeByAppID = async (req,res)=>{
	const reqParams = req?.params;
	if(reqParams?.applicationId == null ){
		res.status(404).send({Success:false,message:"Validation Error"});
	}
	// try{
	// 	const query = {applicationId :reqParams.applicationId};
	// 	let user = await userModel.findOne(query);
	// 	logger.info(`user data ::::: ${user}`)                                         
	// 	let setNoticeFromSRO;
	// 	let SRno = await sequenceModel.findOne({sroNumber:user.sroNumber})
	// 	logger.info(`Sequance data ::::: ${SRno}`)                                        
	// 	if(!user?.issetToNotice){
	// 		if(SRno.sequence == undefined || SRno.sequence ==0){
	// 			setNoticeFromSRO = await sequenceModel.findOneAndUpdate({sroNumber:user.sroNumber},{$set:{sequence:1}});
	// 		}else{
	// 			setNoticeFromSRO = await sequenceModel.findOneAndUpdate({sroNumber:user.sroNumber},{$set:{sequence:SRno.sequence + 1}});
	// 		}
			
	// 	}
	// 	let noticeNumber = (setNoticeFromSRO.sequence == undefined || setNoticeFromSRO.sequence == 0) ? 1 : setNoticeFromSRO.sequence + 1;
	// 	logger.info(`noticeNumber ::::: ${noticeNumber}`)                                       
	// 	const update ={
	// 		issetToNotice:true,
	// 		noticeSeqNumber : noticeNumber,
	// 		noticeStartDate : new Date(),
	// 		noticeEndDate :  new Date(new Date().setDate(new Date().getDate() + 30)) // adding timestamp now

	// 		//moment().add(1, 'months').format('DD/MM/YYYY')
	// 	};
	// 	 let response = await dbHelper.fAndUpdateMethod(sysConstants.Col_users,query,update);
	// 	 logger.info(`response ::::: ${response}`)                                        
	// 	if(response.value != null){
	// 		res.status(200).send({Success:true,message:"Update Successfully"});
	// 		return;
	// 	}else{
	// 		res.status(400).send({Success:false,message:`${process.env.BAD_REQUEST}`});
	// 	}
	// }

	try {
		const query = { applicationId: reqParams.applicationId };
		let user = await userModel.findOne(query);

		if (!user) {
			return res.status(404).send({ Success: false, message: "User not found" });
		}

		logger.info(`user data ::::: ${user}`);

		let SRno = await sequenceModel.findOne({ sroNumber: user.sroNumber });

		if (!SRno) {
			return res.status(400).send({
				Success: false,
				message: "Sequence not found for SRO",
			});
		}

		let updatedSequence;

		// treat undefined as false
		if (!user.issetToNotice) {

			updatedSequence = await sequenceModel.findOneAndUpdate(
				{ sroNumber: user.sroNumber },
				{ $inc: { sequence: 1 } },
				{ new: true }
			);
		}

		let noticeNumber = updatedSequence?.sequence || SRno.sequence;

		const update = {
			issetToNotice: true,
			noticeSeqNumber: noticeNumber,
			noticeStartDate: new Date(),
			noticeEndDate: new Date(
				new Date().setDate(new Date().getDate() + 30)
			),
		};

		let response = await dbHelper.fAndUpdateMethod(
			sysConstants.Col_users,
			query,
			update
		);

		if (response?.value != null) {
			return res.status(200).send({
				Success: true,
				message: "Update Successfully",
			});
		} else {
			return res.status(400).send({
				Success: false,
				message: process.env.BAD_REQUEST,
			});
		}

	} catch(ex){
		logger.error('error :::',ex)                                         
		res.status(500).send({success: false,message:'Internal Server Problem'})
	}
};

Date.prototype.today = function () { 
    return ((this.getDate() < 10)?"0":"") + this.getDate() +"/"+(((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1) +"/"+ this.getFullYear();
}

Date.prototype.timeNow = function () {
	let min = this.getMinutes()+10;
     return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((min < 10)?"0":"") + min;
}

/**
   * @api : /officer/allUsers,
   * @apiType : GET,
   * @apiDesc : Get All the users
   * @apiResponse : 200,Success Response
*/
const usersgetByDist = async (req,res)=>{
	try{
		const reqQuery = req.query;
		logger.info(`reqQuery ::::: ${JSON.stringify(reqQuery)}`)                                        
		let users;
		
		if(reqQuery.district == undefined){
			users = await userModel.find({});
		}else{
			const query = {sroDistrict : reqQuery.district.toUpperCase(),issetToNotice:true, status:"PENDING" }
			users = await userModel.find(query);
		}
		logger.info(`users ::::: ${users}`)                                        
		let fData =[];
		users.map((m)=>{
			if(m.noticeEndDate){
				let date = new Date(m.noticeEndDate)
				if(!moment(date).isBefore(moment(), "day") == true){
					fData = [...fData,m];
				}
			}
			return;
		});

		logger.info(`fData ::::: ${fData}`)                                       
		if(fData.length >0){
			return res.status(200).send({Success:true,data:fData,message:"All Users fetched Successfully"})
		}else{
			return res.status(400).send({Success:false,data:null,message:`${process.env.BAD_REQUEST}`})
		}
	}catch(ex){
		logger.error('error :::',ex)                                         
		res.status(500).send({success: false,message:'Internal Server Problem'})
	}
}
/**
   * @api : /officer/update/sro/{sroOffice},
   * @apiType : PUT,
   * @api @param {sroOffice} is name of SROOffice(town/city)
   * @apiDesc : update SRO name Based onsroOffice
   * @apiResponse : 200,Success Response
*/
const update = async (req,res)=>{
	const reqParams = req.params;
	let reqBody = req.body;
	logger.info(`reqParams ::::: ${JSON.stringify(reqParams)}`)
	logger.info(`reqBody ::::: ${JSON.stringify(reqBody)}`)                                                                               
	let query;
	// if(!reqBody.sroName){
	// 	return res.status(404).send({Success:false,message:"sroName is Required"});
	// }
	if(reqParams.type =="password"){
		if(!passwordPattern.test(reqBody.newPassword)){
			return res.status(400).send({Success: false, message: "Password should meet the password policy.!"});
		}
		query = req.user.role === 'SRO' ? {"sroNumber":parseInt(req.user.sroNumber),loginPassword:reqBody.oldPassword} : {"loginEmail": req.user.loginEmail,loginPassword:reqBody.oldPassword};
		reqBody ={loginPassword:reqBody.newPassword};
	}else if(reqParams.type =="name"){
		query ={"sroNumber":parseInt(req.user.sroNumber)};
		reqBody ={sroName:reqBody.sroName};
	}
	try{
		let sroDetails = await dbHelper.findOneMethod(sysConstants.Col_Officers,query);
		logger.info(`sroDetails ::::: ${sroDetails}`)                                                                                
		if(!sroDetails){
			return res.status(400).send({Success:false,message:`${process.env.BAD_REQUEST}`});
		}

		let update = await officerModel.findOneAndUpdate({"_id":sroDetails._id},{$set:reqBody});
		logger.info(`update ::::: ${update}`)                                                                                
		if(update !== null){
			return res.status(200).send({Success:true,message:"Update Successfully"})
		}
	}catch(ex){	
		logger.error('error :::',ex)                                                                                 
		res.status(500).send({success: false,message:'Internal Server Problem'})
	}
}

/**
   * @api : /officer/{sroOffice}
   * @apiType : GET,
   * @api @param {sroOffice} is name of SROOffice(town/city)
   * @apiDesc : GET details of Particular SROOffice
   * @apiResponse : 200,Success Response
*/
const getSroDetails = async (req,res)=>{
	const reqParams = req.params;
	const reqUser = req.user;
	logger.info(`reqUser ::::: ${reqUser}`)                                                                                
	let query = {"sroNumber" : parseInt(reqUser.sroNumber)}
	try{
		let sroDetails = await dbHelper.findOneMethod(sysConstants.Col_Officers,query);
		logger.info('sroDetails :::',sroDetails)                                                                                 
		
		let Obj={
			_id: sroDetails._id,
			loginType:sroDetails.loginType,
			sroDistrict:sroDetails.sroDistrict,
			sroOffice:sroDetails.sroOffice,
			sroNumber:sroDetails.sroNumber,
			loginName:sroDetails.loginName,
			loginEmail:sroDetails.loginEmail,
			sroName:sroDetails.sroName
		}
		if(!sroDetails){
			return res.status(404).send({Success:false,message:"Invalid"});
		}else{
			return res.status(200).send({Success:true,data:Obj})
		}
	}catch(ex){	
		logger.error('error :::',ex)                                                                                 
		return res.status(500).send({success: false,message:'Internal Server Problem'})
	}
}

/**
   * @api : /officer/saveUser
   * @apiType : POST,
   * @apiDesc : User Saved by Officer
   * @apiResponse : 200,Success Response
*/
const  saveUserbyOfficer = async (req,res) =>{
	const reqBody = req?.body;
	// if(reqBody.husbandName == null || reqBody.husbandFatherName == null ||  reqBody.husbandMotherName == null || reqBody.husbandReligion == null || reqBody.husbandCaste == null || reqBody.husbandCastename == null || reqBody.husbandMobile == null || reqBody.husbandOccupation == null || reqBody.husbandDateofBirth == null || reqBody.husbandMarriageAge == null || reqBody.husbandCountry == null || reqBody.husbandDistrict == null || reqBody.husbandSroOffice == null  ||  reqBody.husbandLengthofResidence == null || reqBody.husbandPermanentAddress == null || reqBody.husbandAddress == null || 
	
	// reqBody.wifeName == null || reqBody.wifeFatherName == null ||  reqBody.wifeMotherName == null || reqBody.wifeReligion == null || reqBody.wifeCaste == null || reqBody.wifeCastename == null || reqBody.wifeMobile == null || reqBody.wifeOccupation == null || reqBody.wifeDateofBirth == null || reqBody.wifeMarriageAge == null || reqBody.wifeCountry == null || reqBody.wifeDistrict == null || reqBody.wifeSroOffice == null || reqBody.wifeLengthofResidence == null || reqBody.wifePermanentAddress == null || reqBody.wifeAddress == null	){
	// 	return res.status(400).send({Status:false,message:"Invalid "})
	// }
	let validation = await userValidations(reqBody);
	logger.info(`validation ::::: ${JSON.stringify(validation)}`)                                                                               
	if(validation && validation.status == false){
		return res.status(400).send({Success:false,message:validation.err})
	}
	try{
		reqBody.status = "PENDING";
		let query = {sroDistrict:reqBody.sroDistrict,sroOffice:reqBody.sroOffice};
		let getCode = await dbHelper.findOneMethod(sysConstants.Col_Officers,query);
		logger.info(`getCode ::::: ${getCode}`)                                                                              
		reqBody.sroNumber = parseInt(getCode.sroNumber);
		// reqBody.sroNumber = getCode.sroNumber;
		['husbandDateofBirth','husbandDivorceDate', 'wifeDateofBirth', 'wifeDivorceDate', 'slotDate', 'regDate', 'marriageDate', 'wifeLengthofResidence', 'husbandLengthofResidence'].forEach(o => {
			if(reqBody[o]){
				reqBody[o] = new Date(`${reqBody[o]}T00:00:00Z`);
			}
		})
		reqBody.applicationId = await generateDocumentId(getCode.sroNumber);
		let data = new userModel(reqBody);
		let user =await data.save();
		logger.info(`user data ::::: ${user}`)                                                                               
		return res.status(200).send({Success:true,data:{_id: user._id,applicationId: user.applicationId},message:"Data Saved Successfully"})
	}catch(ex){	
		logger.error('error :::',ex)                                                                                 
		return res.status(500).send({Success:false,message:'Internal Server Problem'})	}

}

const getUsersBySRO = async (req, res) => {
	try {
		const searchDuration = parseInt(req?.query?.duration);
		const sroOffice = req?.query?.sro;
		const currentDate = new Date();
		const endDate = new Date(currentDate).toISOString();
        const startDate = new Date(new Date(currentDate.setDate(currentDate.getDate() - searchDuration)).setHours(0, 0, 0)).toISOString();
		const query = { sroOffice, createdAt: { $gt: startDate, $lte: endDate } };
		const data = await userModel.find(query);
		logger.info(`userDetails ::::: ${data}`)                                                                                
		const approvedUsers = data.filter(data => data.status === 'APPROVED' || data.status === 'ACCEPTED');
		const pendingUsers = data.filter(data => data.status === 'PENDING');
		const rejectedUsers = data.filter(data => data.status === 'REJECTED');
		const expiredUsers = data.filter(data => data.status === 'EXPIRED');
		const users = {
			totalReceived: { count: data.length, data },
			approved: { count: approvedUsers.length, data: approvedUsers },
			pending: { count: pendingUsers.length, data: pendingUsers },
			rejected: { count: rejectedUsers.length, data: rejectedUsers },
			expired: { count: expiredUsers.length, data: expiredUsers },
		};
		logger.info(`users ::::: ${users}`)                                                                                
		res.status(200).send({Success:true, users, message:'Data fetched Successfully!'});
	} catch (ex) {
		logger.error('error :::',ex)                                                                                 
		return res.status(500).send({Success: false, message: 'Internal Server Problem'});
	}
}
const generateDocumentId =async (sroCode)=> {
	return "APSPL" + new Date().getFullYear() + "" +sroCode+ Math.round(new Date()/1);
	//return like AP2021874687
}

const sroDataEntryDocsUpload = async(req,res) => {
    try {
		const reqFiles = req.files;
        const reqParams = req.params;
		logger.info(`reqParams ::::: ${JSON.stringify(reqParams)}`)                                                                                
		const [local, rest] = req.get("host").split(":");
		let Url = req.protocol + "://" + req.get("host") + "/uploads";
        let tempObj;
		let userDetails = await usersModel.findOne({"_id":ObjectId(reqParams.id)});
		logger.info(`userDetails ::::: ${userDetails}`)                                                                                
		for(let i in req.files){
			tempObj= {
				fileName:req.files[i].filename,
				filePath:req.files[i].path,
				fieldname:req.files[i].fieldname,
				downloadLink: `${Url}/${reqParams.id}/${req.files[i].filename}`,
				timeStamp:new Date()
			}
			// let query = {"_id": ObjectId(reqParams.id)}
			if(userDetails.documents.length === 0){
				await userModel.findOneAndUpdate({ _id:ObjectId(reqParams.id),documents:{$nin:tempObj}},{$push:{documents:tempObj}});

			}else{
				for(let fdName in userDetails.documents){
					if(userDetails.documents[fdName].fieldname == tempObj.fieldname){
						await userModel.findOneAndUpdate({ _id:ObjectId(reqParams.id),documents:{$nin:tempObj}},{$push:{documents:tempObj}});
					}
				}
			}
		};
		
		return res.status(200).send({Success:true,message:"Documents Saved Successsfully"})
    } catch (err) {	
		logger.error('error :::',err)                                                                                 
		return res.status(500).send({Success:false,message:'Internal Server Problem'})    }
};

// exports.resetPswrd =async (req)=>{
// 	try{
// 		const reqBody = req.body;
// 		if(reqBody && (reqBody.loginEmail === undefined || !reqBody.loginPassword === undefined)){
// 			return({success:false,status:400,message:`Bad request,  loginEmail or loginPassword is needed`})
// 		}
// 		const fndQuery ={"loginEmail":reqBody.loginEmail};
// 		const findUser = await dbHelper.findOneMethod(sysConstants.Col_Officers,fndQuery)
// 		if(!findUser){
// 			return ({success:true,status:404,message:`No User is available with this Email- ${reqBody.loginEmail}`});
// 		}else{
// 			const updateQuery ={"loginPassword":reqBody.newPassword};
// 			const data = await dbHelper.fAndUpdateMethod(sysConstants.Col_Officers,fndQuery,updateQuery)
			
// 			if(data.value !== null){
// 				return ({success:true,status:200,message:"Password updated Sucessfully!!!"})
// 			}else{
// 				return ({success:false,status:400,message:sysConstants.Error_400})
// 			}	
// 		}
// 	}catch(ex){
// 		return ({success:false,status:500,message:ex.message})
// 	}
// }


const officerStatistics = async (req, res) => {
	try {
		const reqBody = req.body;
		// let pageFrom = parseInt(req.query.page);
		// let limit = parseInt(req.query.limit);
		// let searchvalue = req.query.search;
		let { fromDate: startDate, toDate: endDate, search: searchvalue, limit,  page: pageFrom } = req.query;
		startDate = startDate ? moment(startDate, "YYYY-MM-DD").startOf("day").toDate() : null;
		endDate = endDate ? moment(endDate, "YYYY-MM-DD").endOf("day").toDate() : null;
		limit = parseInt(limit) || 10;
		pageFrom = parseInt(pageFrom) || 0;

		let userData = req.user;
		var regex;

		if (searchvalue != undefined && searchvalue != null && searchvalue.length > 0)
			regex = new RegExp("^" + searchvalue, "g");
		let officerData = await officerModel.findOne({ _id: userData.loginId });
		logger.info(`officerData ::::: ${officerData}`)                                                                                
		let sroList = [];
		let tempSroList;

		if (officerData) {
			if (officerData.role == "SRO") {
				tempSroList = [];
				let tempSROData = {totalCount: 1,districtName: officerData.sroDistrict,parentSroCode: officerData.sroNumber,sroName: officerData.sroOffice,};
				tempSroList.push(tempSROData);
				sroList.push(parseInt(officerData.sroNumber));
			} else if (officerData.role == "DR") {
				let dataListQuery;
				if (regex)
					dataListQuery = {districtName: officerData.district,sroName: regex,parentSroCode: { $ne: null },};
				else
					dataListQuery = {districtName: officerData.district,parentSroCode: { $ne: null },};
				tempSroList = await masterDataModel.aggregate([
					{ $match: dataListQuery },
					{ $group: { _id: { districtName: "$districtName", sroName: "$sroName", parentSroCode: "$parentSroCode", }, }, },
					{ $project: {_id: 0, districtName: "$_id.districtName", sroName: "$_id.sroName", parentSroCode: "$_id.parentSroCode",},},
					{ $sort: { districtName: 1, sroName: 1 } },
					{ $setWindowFields: { output: { totalCount: { $count: {} } } } },
					{ $skip: limit * pageFrom },
					{ $limit: limit },
				]);
				sroList = [...new Set(tempSroList.map((item) => parseInt(item["parentSroCode"]))),];
			} else if (officerData.role == "DIG") {
				let dataListQuery;
				if (regex)
					dataListQuery = {$or: [{ sroName: regex }, { districtName: regex }],districtName: { $in: officerData.subDistrict },parentSroCode: { $ne: null },};
				else
					dataListQuery = {districtName: { $in: officerData.subDistrict },parentSroCode: { $ne: null },};
				tempSroList = await masterDataModel.aggregate([
					{ $match: dataListQuery },
					{$group: {_id: {districtName: "$districtName",sroName: "$sroName",parentSroCode: "$parentSroCode",},},},
					{$project: {_id: 0,districtName: "$_id.districtName",sroName: "$_id.sroName",parentSroCode: "$_id.parentSroCode",},},
					{ $sort: { districtName: 1, sroName: 1 } },
					{ $setWindowFields: { output: { totalCount: { $count: {} } } } },
					{ $skip: limit * pageFrom },
					{ $limit: limit },
				]);
				sroList = [...new Set(tempSroList.map((item) => parseInt(item["parentSroCode"]))),];
			} else if (officerData.role == "IG") {
				let dataListQuery;
				if (regex)
					dataListQuery = {$or: [{ sroName: regex }, { districtName: regex }],parentSroCode: { $ne: null },};
				else dataListQuery = { parentSroCode: { $ne: null } };
				tempSroList = await masterDataModel.aggregate([
					{ $match: dataListQuery },
					{ $group: {_id: {districtName: "$districtName",sroName: "$sroName",parentSroCode: "$parentSroCode",},},},
					{ $project: {_id: 0,districtName: "$_id.districtName",sroName: "$_id.sroName",parentSroCode: "$_id.parentSroCode",},},
					{ $sort: { districtName: 1, sroName: 1 } },
					{ $setWindowFields: { output: { totalCount: { $count: {} } } } },
					{ $skip: limit * pageFrom },
					{ $limit: limit },
				]);
				sroList = [...new Set(tempSroList.map((item) => parseInt(item["parentSroCode"]))),];
			}
		}
		let finalResult = [];

		if (tempSroList != undefined && tempSroList.length > 0) {
			const currentDate = new Date(); currentDate.setDate(currentDate.getDate());
			let noticeEndDateQuery = {$lt: currentDate}
			let numOfDays = req.query.numOfDays;
			const fromDate = new Date();
			fromDate.setDate(fromDate.getDate() - numOfDays);
			let totalMatchCondition = {
				status :  {$nin:["DRAFT",'',null]},
				sroNumber: { $in: sroList },
				noticeEndDate: noticeEndDateQuery,
			};

			let statusWiseMatchCondition = {
				sroNumber: { $in: sroList },
				status: { $in: ["EXPIRED", "REJECTED", "PENDING", "ACCEPTED"] },
				noticeEndDate: noticeEndDateQuery,
			};

			if (startDate && endDate) {
				totalMatchCondition.regDate = { $gte: startDate, $lte: endDate };
				statusWiseMatchCondition.regDate = { $gte: startDate, $lte: endDate };
			}

			const totalResultsAggregationQuery = [
				{ $match: totalMatchCondition },
				{ $group: {_id: {sroOffice: "$sroOffice",sroNumber: "$sroNumber",sroDistrict: "$sroDistrict",},count: { $sum: 1 },},},
			];
			let totalResults = await userModel.aggregate(totalResultsAggregationQuery);

			logger.info(`totalResults ::::: ${totalResults}`);

			const aggregationQuery = [
				{ $match: statusWiseMatchCondition },
				{$group: {_id: {sroOffice: "$sroOffice",status: "$status",sroNumber: "$sroNumber",sroDistrict: "$sroDistrict",},count: { $sum: 1 },},},
			];
			let statusWiseResults = await userModel.aggregate(aggregationQuery);
			logger.info(`statusWiseResults ::::: ${statusWiseResults}`);
                                                                                
			tempSroList.forEach((resultData) => {
				let sroNumberVal = resultData.parentSroCode;
				let tempObj = {};
				tempObj.sroName = resultData.sroName;
				tempObj.totalRecords = resultData.totalCount;
				tempObj.sroNumber = sroNumberVal;
				tempObj.created = 0;
				tempObj.accepted = 0;
				tempObj.pending = 0;
				tempObj.rejected = 0;
				tempObj.expired = 0;
				tempObj.district = resultData.districtName;
				if (totalResults.length > 0) {
					totalResults.forEach((totalResultData) => {
						if (totalResultData._id.sroNumber == parseInt(sroNumberVal)) {
							tempObj.created = totalResultData.count;
							return false;
						}
					});
					if (statusWiseResults.length > 0) {
						statusWiseResults.forEach((statusWiseResultData) => {
							if (
								statusWiseResultData._id.sroNumber == parseInt(sroNumberVal)
							) {
								if (statusWiseResultData._id.status == "PENDING")
									tempObj.pending = statusWiseResultData.count;
								else if (statusWiseResultData._id.status == "ACCEPTED")
									tempObj.accepted = statusWiseResultData.count;
								else if (statusWiseResultData._id.status == "REJECTED")
									tempObj.rejected = statusWiseResultData.count;
								else if (statusWiseResultData._id.status == "EXPIRED")
									tempObj.expired = statusWiseResultData.count;
							}
							if ( tempObj.pending > 0 && tempObj.accepted > 0 && tempObj.rejected > 0 && tempObj.expired > 0 ) {
								if ( tempObj.pending + tempObj.completed + tempObj.rejected + tempObj.expired > tempObj.created)
									tempObj.created = tempObj.pending + empObj.completed + tempObj.rejected + tempObj.expired;
								return false;
							}
						});
					}
				}
				finalResult.push(tempObj);
			});
		}
		logger.info(`finalResult ::::: ${finalResult}`)                                                                               
		res.status(200).send({ status: true, data: finalResult });
	} catch (err) {
	 logger.error('error :::',err)                                                                                 
	 console.error(err);
	 res.status(500).send({ status: false, message: "Internal Server Error." });
	}
};

const officerStatisticDetails = async (req, res) => {
    try {
        const status = req.query.status ? req.query.status.toUpperCase() : null;
        // const fromDate = new Date();
        // fromDate.setDate(fromDate.getDate() - req.query.period);

		let { fromDate: startDate, toDate: endDate } = req.query;

        let userData = req.user;
        let query = {};
        if (userData.loginType.toUpperCase() == "OFFICER") {
            // let sroNumber = parseInt(req.body.sroNumber);
			let sroNumber = req.query.sroNumber
            let officerData = await officerModel.findOne({
                _id: ObjectId(userData.loginId),
            });

            if (status!="CREATED") {
                if (officerData.role == "SRO") {
                    query = {
						sroNumber: officerData.sroNumber,
						status: status ? status : { $nin: ["DRAFT", "", null] },
                        // createdAt: { $gte: fromDate },
                    };
                } else if (officerData.role == "DR") {
                    query = {
                        // status,
						// sroNumber,
                        sroDistrict: officerData.district,
						status: status ? status : { $nin: ["DRAFT", "", null] }
                        // createdAt: { $gte: fromDate },
                    };
                } else if (officerData.role == "DIG") {
                    query = {
                        // status,
						// sroNumber,
                        sroDistrict: { $in: officerData.subDistrict },
						status: status ? status : { $nin: ["DRAFT", "", null] }
                        // createdAt: { $gte: fromDate },
                    };
                } else if (officerData.role == "IG") {
                    query = {
						//  status, 
						//  sroNumber,
						 status: {$nin:["DRAFT",'',null]},
						//  createdAt: { $gte: fromDate } 
						};
                }
				
            } else {
                if (officerData.role == "SRO") {
                    query = {
                        sroNumber: officerData.sroNumber,
                        // createdAt: { $gte: fromDate },
                    };
                } else if (officerData.role == "DR") {
                    query = {
						sroNumber,
                        sroDistrict: officerData.district,
                        // createdAt: { $gte: fromDate },
                    };
                } else if (officerData.role == "DIG") {
                    query = {
						sroNumber,
                        sroDistrict: { $in: officerData.subDistrict },
                        // createdAt: { $gte: fromDate },
                    };
                } else if (officerData.role == "IG") {
                    query = {
						 sroNumber,
						//  createdAt: { $gte: fromDate }
						 };
                }
				query["status"] = {$nin:["DRAFT",'',null]};
            }
			const currentDate = new Date(); currentDate.setDate(currentDate.getDate());
            let noticeEndDateQuery = { $lte:currentDate };
            query["noticeEndDate"] = noticeEndDateQuery;

			if (startDate && endDate) {
				const from = new Date(startDate + "T00:00:00.000Z");
				const to = new Date(endDate + "T00:00:00.000Z");
				to.setUTCDate(to.getUTCDate() + 1);

				query.regDate = {
					$gte: from,
					$lt: to
				};
			}

            const data = await userModel.find(query);
			logger.info(`user data ::::: ${data}`)                                                                                
            let response = [];
            data.map((d) => {
                let amOrPm = d.slotTime.replace(/(?:AM|PM)/g, "");
                let [hrs, rest] = amOrPm.split(":");
                if (hrs < 9) {
                    hrs = Number(hrs) + 12;
                }
                amOrPm = `${hrs}:${rest}`;
                const Obj = {};
                Obj["id"] = d._id;
                Obj["appNo"] = d.appNo;
                Obj["status"] = d.status;
                Obj["husbandName"] = d.husbandName;
                Obj["wifeName"] = d.wifeName;
                Obj["regDate"] = d.regDate;
                Obj["slotDate"] = d.slotDate;
                Obj["slotTime"] = amOrPm;
                Obj["sroOffice"] = d.sroOffice;
                Obj["sroMandal"] = d.sroMandal;
                Obj["sroVillage"] = d.sroVillage;
                Obj["mrgType"] = d.mrgType;
                Obj["applicationId"] = d.applicationId;
				Obj["issetToNotice"] = d.issetToNotice;
                response = [...response, Obj];
            });
            response = await sortBytime(response);
            response.map((t) => {
                let [hrs, rest] = t.slotTime.split(":");
                if (hrs > 12) {
                    hrs = Number(hrs) - 12;
                    rest = rest + "PM";
                } else {
                    rest = rest + "AM";
                }
                t.slotTime = `${hrs}:${rest}`;
            });
			logger.info(`response ::::: ${response}`)                                                                                
            res.status(200).send({ status: true, data: response });
        } else
            res.status(401).send({ status: false, message: "Invalid data access." });
    } catch (err) {
		logger.error('error :::',err)                                                                                 
        console.error("Process Error", err);
        res.status(500).send({ status: false, mesage: "Internal Server Error." });
    }
};

const officerStatisticsdistrictdata = async (req, res) => {
	try {
		const reqBody = req.body;
		let searchvalue = reqBody.search;
		let userData = req.user;
		var regex;
		if (searchvalue != undefined && searchvalue != null && searchvalue.length > 0)
			regex = new RegExp("^" + searchvalue, "g");
		let officerData = await officerModel.findOne({ _id: userData.loginId });
		logger.info(`officerData ::::: ${officerData}`)                                                                                 
		if (officerData != null && officerData != undefined) {
			let dataListQuery;
			if (officerData.role == "DR" ) {
				dataListQuery = { husbandDistrict: officerData.district,  status: { $ne: "DRAFT" } }
			} else if (officerData.role == "DIG") {
				if (regex)
					dataListQuery = { husbandDistrict: regex, husbandDistrict: { $in: officerData.subDistrict }, status: { $ne: "DRAFT" } };
				else
					dataListQuery = { husbandDistrict: { $in: officerData.subDistrict }, status: { $ne: "DRAFT" } };
			} else if (officerData.role == "IG") {
				if (regex)
					dataListQuery = { husbandName: { "$ne": "" }, husbandDistrict: regex, status: { $ne: "DRAFT" } }
				else
					dataListQuery = { husbandName: { "$ne": "" },  status: { $ne: "DRAFT" } };
			}
			if (dataListQuery != undefined) {
				let tempDistrictList = await usersModel.aggregate([
					{ "$match": dataListQuery },
					{ "$group": { _id: { husbandDistrict: "$husbandDistrict" }, count: { $sum: 1 } } },
					{ "$project": { _id: 0, districtName: "$_id.husbandDistrict", created: "$count" } },
					{ "$sort": { districtName: 1 } },
					{ $setWindowFields: { output: { totalCount: { $count: {} } } } }
				]);
				logger.info(`tempDistrictList ::::: ${tempDistrictList}`)                                                                                 
				dataListQuery["status"] = { $in: ["PENDING", "ACCEPTED", "EXPIRED", "REJECTED"] };
				let statusWiseResults = await usersModel.aggregate([
					{ "$match": dataListQuery },
					{ "$group": { _id: { status: "$status", district: "$husbandDistrict" }, count: { $sum: 1 } } }
				]);
				logger.info(`statusWiseResults ::::: ${statusWiseResults}`)                                                                                
				let finalResult = [];
				if (tempDistrictList != undefined && tempDistrictList.length > 0) {
					tempDistrictList.forEach(resultData => {
						let tempObj = {};
						tempObj.totalRecords = resultData.totalCount;
						tempObj.created = resultData.created;
						tempObj.accepted = 0;
						tempObj.pending = 0;
						tempObj.rejected = 0;
						tempObj.expired = 0;
						let isOtherFound = false;
						if (resultData.districtName==null || resultData.districtName.trim().length == 0){
							if(finalResult.length>0)
							{
								finalResult.forEach(statisticsData => {
									if(statisticsData.district==="OTHERS")
									{
										tempObj = statisticsData;
										tempObj.created = tempObj.created+resultData.created;
										isOtherFound = true;
									}
								});
							}
							else
								tempObj.district = "OTHERS";
						}
						else
							tempObj.district = resultData.districtName;

						if (statusWiseResults.length > 0) {
							statusWiseResults.forEach(statusWiseResultData => {
								if ((statusWiseResultData._id.district) == (resultData.districtName)) {
									if (statusWiseResultData._id.status == "PENDING")
										tempObj.pending = tempObj.pending + statusWiseResultData.count;
									else if (statusWiseResultData._id.status == "ACCEPTED")
										tempObj.accepted = tempObj.accepted + statusWiseResultData.count;
									else if (statusWiseResultData._id.status == "REJECTED")
										tempObj.rejected = tempObj.rejected + statusWiseResultData.count;
									else if (statusWiseResultData._id.status == "EXPIRED")
										tempObj.expired = tempObj.expired + statusWiseResultData.count;
								}
							});
						}
						
						if ((tempObj.pending + tempObj.accepted + tempObj.rejected + tempObj.expired) > tempObj.created)
							tempObj.created = tempObj.pending + tempObj.accepted + tempObj.rejected + tempObj.expired;
						
						if(!isOtherFound)
							finalResult.push(tempObj);
					});
				}
				logger.info(`finalResult ::::: ${finalResult}`)                                                                                
				res.status(200).send({ status: true, data: finalResult });
			}
			else
				res.status(402).send({ status: false, message: "Un authorized access." });
		}
	} catch (err) {
		logger.error(" error ::: ", err);
		console.log(" error ::: ", err);
		res.status(500).send({ status: false, message: "Internal Server Error." });
	}
};

const officerStatisticsMandaldata = async(req,res) => {
        try {
			const reqBody = req.body;
			let searchvalue = reqBody.search;
			let districtVal=reqBody.district;
            let userData = req.user;
            var regex;
            if (searchvalue != undefined && searchvalue != null && searchvalue.length > 0)
                regex = new RegExp("^" + searchvalue, "g");
            let officerData = await officerModel.find({ _id: userData.loginId });
			logger.info(`officerData ::::: ${officerData}`)                                                                                                                                                                
            if (officerData.length > 0) {
                let dataListQuery;
                let isValidCondition = false
                if (officerData[0].role == "DR") {
                    if(officerData[0].district===districtVal)
                        isValidCondition = true;
                } else if (officerData[0].role == "DIG") {
                    if(officerData[0].subDistrict.includes(districtVal))
                        isValidCondition = true;
                } else if (officerData[0].role == "IG") 
                    isValidCondition = true;
                
                if(isValidCondition)
                {
                    dataListQuery = { husbandDistrict: districtVal, status:{$ne:"DRAFT"} };
                    if (regex)
                        dataListQuery["husbandMandal"]=regex;                    
                }
                
                if (dataListQuery != undefined) {
                    let tempDistrictList = await userModel.aggregate([
                        { "$match": dataListQuery },
                        { "$group": { _id: { husbandDistrict: "$husbandDistrict",husbandMandal:"$husbandMandal" }, count: { $sum: 1 } } },
                        { "$project": { _id: 0, districtName: "$_id.husbandDistrict",mandalName:"$_id.husbandMandal", created: "$count" } },
                        { "$sort": { districtName: 1 ,mandalName: 1} },
                        { $setWindowFields: { output: { totalCount: { $count: {} } } } }
                    ]);
					logger.info(`tempDistrictList ::::: ${tempDistrictList}`)                                                                                
                    dataListQuery["status"] = { $in: ["PENDING","ACCEPTED","REJECTED","EXPIRED"] };
                    let statusWiseResults = await userModel.aggregate([
                        { "$match": dataListQuery },
                        { "$group": { _id: { status: "$status", district: "$husbandDistrict",mandal:"$husbandMandal" }, count: { $sum: 1 } } }
                    ]);
					logger.info(`statusWiseResults ::::: ${statusWiseResults}`)                                                                                
                    let finalResult = [];
                    if (tempDistrictList != undefined && tempDistrictList.length > 0) {
                        tempDistrictList.forEach(reusltData => {
                            let tempObj = {};
                            tempObj.totalRecords = reusltData.totalCount;
                            tempObj.created = reusltData.created;
                            tempObj.accepted = 0;
                            tempObj.pending = 0;
							tempObj.rejected = 0;
							tempObj.expired = 0;
                            tempObj.district = reusltData.districtName;

							let isOtherFound = false;
							if (reusltData.mandalName == null || reusltData.mandalName.trim().length == 0) {
								if (finalResult.length > 0) {
									finalResult.forEach(statisticsData => {
										if (statisticsData.mandal === "OTHERS") {
											tempObj = statisticsData;
											tempObj.created = tempObj.created + reusltData.created;
											isOtherFound = true;
										}
									});
								}
								else
									tempObj.mandal = "OTHERS";
							}
							else
								tempObj.mandal = reusltData.mandalName;
                            if (statusWiseResults.length > 0) {
                                statusWiseResults.forEach(statusWiseResultData => {
                                    if ((statusWiseResultData._id.mandal) === (reusltData.mandalName)) {
                                        if (statusWiseResultData._id.status == "PENDING")
                                            tempObj.pending = tempObj.pending + statusWiseResultData.count;
                                        else if (statusWiseResultData._id.status == "ACCEPTED")
                                            tempObj.accepted = tempObj.accepted + statusWiseResultData.count;
										else if (statusWiseResultData._id.status == "REJECTED")
                                            tempObj.rejected =  tempObj.rejected + statusWiseResultData.count;
										else if (statusWiseResultData._id.status == "EXPIRED")
                                            tempObj.expired =  tempObj.expired + statusWiseResultData.count;
                                    }
                                });
                            }
								if ((tempObj.pending + tempObj.accepted + tempObj.rejected + tempObj.expired) > tempObj.created)
									tempObj.created = tempObj.pending + tempObj.accepted + tempObj.rejected + tempObj.expired;
								if(!isOtherFound)
                                   finalResult.push(tempObj);
                        });
                    }
					logger.info(`finalResult ::::: ${finalResult}`)
                    res.status(200).send({ status: true, data: finalResult });
                } else {
					res.status(402).send({ status: false, message: "Un authorized access." });
                }
            }
        } catch (err) {
			console.log(" error ::: ", err);
			logger.error(" error ::: ", err);
			res.status(500).send({ status: false, message: "Internal Server Error." });
        }
};

const officerStatisticsvillagedata = async(req,res) => {
        try {
			const reqBody = req.body;
			let searchvalue = reqBody.search;
			let districtVal=reqBody.district;
			let mandalVal=reqBody.mandal;
            let userData = req.user;
            var regex;
            if (searchvalue != undefined && searchvalue != null && searchvalue.length > 0)
                regex = new RegExp("^" + searchvalue, "g");
            let officerData = await officerModel.find({ _id: userData.loginId });
			logger.info(`officerData ::::: ${officerData}`)
            if (officerData.length > 0) {
                let dataListQuery;
                let isValidCondition = false
                if (officerData[0].role == "DR") {
                    if(officerData[0].district===districtVal)
                        isValidCondition = true;
                } else if (officerData[0].role == "DIG") {
                    if(officerData[0].subDistrict.includes(districtVal))
                        isValidCondition = true;
                } else if (officerData[0].role == "IG") 
                    isValidCondition = true;

                if(isValidCondition)
                {
                    dataListQuery = {husbandDistrict: districtVal, husbandMandal:mandalVal, status:{$ne:"DRAFT"}};
                    if (regex)
                        dataListQuery["husbandVillage"]=regex;                    
                }
                if (dataListQuery != undefined) {
                    let tempDistrictList = await userModel.aggregate([
                        { "$match": dataListQuery },
                        { "$group": { _id: { husbandDistrict: "$husbandDistrict",husbandMandal:"$husbandMandal",husbandVillage:"$husbandVillage" }, count: { $sum: 1 } } },
                        { "$project": { _id: 0, districtName: "$_id.husbandDistrict",mandalName:"$_id.husbandMandal",husbandVillage:"$_id.husbandVillage" ,created: "$count" } },
                        { "$sort": { districtName: 1 ,mandalName: 1,husbandVillage:1} },
                        { $setWindowFields: { output: { totalCount: { $count: {} } } } }
                    ]);
					logger.info(`tempDistrictList ::::: ${tempDistrictList}`)
                    dataListQuery["status"] = { $in: ["PENDING", "ACCEPTED" ,"REJECTED","EXPIRED"] };
                    let statusWiseResults = await userModel.aggregate([
                        { "$match": dataListQuery },
                        { "$group": { _id: { status: "$status", district: "$husbandDistrict",mandal:"$husbandMandal",husbandVillage:"$husbandVillage" }, count: { $sum: 1 } } }
                    ]);
					logger.info(`statusWiseResults ::::: ${statusWiseResults}`)
                    let finalResult = [];
                    if (tempDistrictList != undefined && tempDistrictList.length > 0) {
                        tempDistrictList.forEach(reusltData => {
                            let tempObj = {};
                            tempObj.totalRecords = reusltData.totalCount;
                            tempObj.created = reusltData.created;
                            tempObj.accepted = 0;
                            tempObj.pending = 0;
							tempObj.rejected = 0;
							tempObj.expired = 0;
                            tempObj.mandal = reusltData.mandalName;
                            tempObj.district = reusltData.districtName;
							let isOtherFound = false;
							if (reusltData.husbandVillage == null || reusltData.husbandVillage.trim().length == 0) {
								if (finalResult.length > 0) {
									finalResult.forEach(statisticsData => {
										if (statisticsData.village === "OTHERS") {
											tempObj = statisticsData;
											tempObj.created = tempObj.created + reusltData.created;
											isOtherFound = true;
										}
									});
								}
								else
									tempObj.village = "OTHERS";
							}
							else
								tempObj.village = reusltData.husbandVillage;

                            if (statusWiseResults.length > 0) {
                                statusWiseResults.forEach(statusWiseResultData => {
                                    if ((statusWiseResultData._id.husbandVillage) === (reusltData.husbandVillage)) {
                                        if (statusWiseResultData._id.status == "PENDING")
                                            tempObj.pending =  tempObj.pending + statusWiseResultData.count;
                                        else if (statusWiseResultData._id.status == "ACCEPTED")
                                            tempObj.accepted = tempObj.accepted + statusWiseResultData.count;
										else if (statusWiseResultData._id.status == "REJECTED")
                                            tempObj.rejected = tempObj.rejected + statusWiseResultData.count;
										else if (statusWiseResultData._id.status == "EXPIRED")
                                            tempObj.expired =  tempObj.expired + statusWiseResultData.count;
                                    }
                                });
                            }
							if ((tempObj.pending + tempObj.accepted + tempObj.rejected + tempObj.expired) > tempObj.created)
								tempObj.created = tempObj.pending + tempObj.accepted + tempObj.rejected + tempObj.expired;
							if (!isOtherFound)
								finalResult.push(tempObj);
                        });
                    }
					logger.info(`finalResult ::::: ${finalResult}`)
					res.status(200).send({ status: true, data: finalResult });
                } else {
                    res.status(402).send({ status: false, message: "Un authorized access." });
                }
            }
        } catch (err) {
            console.log(" error ::: ", err);
			logger.error(" error ::: ", err);
			res.status(500).send({ status: false, message: "Internal Server Error." });
        }
};

const getRegistrationsByStatisticValues = async(req,res) => {
        try {
            let userData = req.user;
            let query;
            if (userData.loginType == "officer" && userData.role != "SRO") {
                let districtVal = req.body.district;
                let mandalVal = req.body.mandal;
                let villageVal = req.body.village;
                let statusVal = req.body.status;
                if(districtVal!=undefined && districtVal!=null && districtVal.trim().length>0
                     && statusVal!=undefined && statusVal!=null && statusVal.trim().length>0)
                {
                    if(districtVal=="OTHERS")
                        districtVal = "";
                    let officerData = await officerModel.findOne({ _id: ObjectId(userData.loginId) });
                    if (statusVal != "CREATED") {
                        if (officerData.role == "DR" && (officerData.district==districtVal))
                            query = { status: statusVal, husbandDistrict: districtVal };
                        else if (userData.role == "DIG" && officerData.subDistrict.includes(districtVal))
                            query = { status: statusVal, husbandDistrict: districtVal };
                        else if (userData.role == "IG")
                            query = { status: statusVal, husbandDistrict: districtVal };
                    }
                    else {
                        if (userData.role == "DR" && (officerData.district==districtVal))
                            query = { status: {$in:["PENDING", "NEW", "ACCEPTED", "REJECTED", "EXPIRED"]}, husbandDistrict: districtVal };
                        else if (userData.role == "DIG" && officerData.subDistrict.includes(districtVal))
                            query = { status: {$in:["PENDING", "NEW", "ACCEPTED", "REJECTED", "EXPIRED"]}, husbandDistrict: districtVal };
                        else if (userData.role == "IG")
                            query = { status: {$in:["PENDING", "NEW", "ACCEPTED", "REJECTED", "EXPIRED"]}, husbandDistrict: districtVal };
                    }
                    if(query != undefined && query != null )
                    {
                        if(mandalVal!=undefined && mandalVal!=null)
                            query['husbandMandal'] = mandalVal;
                        if(villageVal!=undefined && villageVal!=null)
                            query['husbandVillage'] = villageVal;
							
                        const data = await userModel.find(query)
						logger.info(`user data ::::: ${data}`)
                        let response = [];						
                        data.map((d) => {
                            let amOrPm = d.slotTime.replace(/(?:AM|PM)/g, '')
                            let [hrs, rest] = amOrPm.split(":");
                            if (hrs < 9) {
                                hrs = Number(hrs) + 12;
                            }
                            amOrPm = `${hrs}:${rest}`
							const Obj = {};
							Obj["id"] = d._id;
							Obj["appNo"] = d.appNo;
							Obj["status"] = d.status;
							Obj["husbandName"] = d.husbandName;
							Obj["wifeName"] = d.wifeName;
							Obj["regDate"] = d.regDate;
							Obj["slotDate"] = d.slotDate;
							Obj["slotTime"] = amOrPm;
							Obj["sroOffice"] = d.sroOffice;
							Obj["sroMandal"] = d.sroMandal;
							Obj["sroVillage"] = d.sroVillage;
							Obj["mrgType"] = d.mrgType;
							Obj["applicationId"] = d.applicationId;
							response = [...response, Obj];
                        });
                        response = await sortBytime(response);
                        response.map((t) => {
                            let [hrs, rest] = t.slotTime.split(":");
                            if (hrs > 12) {
                                hrs = Number(hrs) - 12;
                                rest = rest + 'PM';
                            } else {
                                rest = rest + 'AM';
                            }
                            t.slotTime = `${hrs}:${rest}`;
                        })
						logger.info(`response ::::: ${response}`)
						res.status(200).send({ status: true, data: response });
                    }else
                        res.status(402).send({ status: false, message: "Un authorized access." });
                }else
					res.status(400).send({ status: false, message: "Bad Request." });
            }
            else
                res.status(402).send({ status: false, message: "Un authorized access." });
        } catch (err) {
			console.log(" error ::: ", err);
			logger.error(" error ::: ", err);
		    res.status(500).send({ status: false, message: "Internal Server Error." });
        }
};

async function sortBytime(data) {
    await data.sort((a, b) => {
        if (a.slotDate == b.slotDate) {
            if (
                Number(a.slotTime.substring(0, 2)) == Number(b.slotTime.substring(0, 2))
            ) {
                const [aRest, aMnts] = a.slotTime.split(": ");
                const [bRest, bMnts] = b.slotTime.split(": ");
                if (aMnts >= bMnts) {
                    return b.slotTime.localeCompare(a.slotTime);
                } else {
                    return a.slotTime.localeCompare(b.slotTime);
                }
            } else {
                return b.slotTime.localeCompare(a.slotTime);
            }
        } else {
            return b.slotDate.toISOString().localeCompare(a.slotDate.toISOString());
        }
    });
    return data;
}

module.exports = {
	signUp,
	login,
	updateNoticeByAppID,
	usersgetByDist,
	update,
	getSroDetails,
	saveUserbyOfficer,
	sroDataEntryDocsUpload,
	getUsersBySRO,
	officerStatistics,
	officerStatisticsdistrictdata,
	officerStatisticsMandaldata,
	officerStatisticsvillagedata,
	getRegistrationsByStatisticValues,
    officerStatisticDetails 
}
