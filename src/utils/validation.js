
const moment = require('moment');
const casteList = require('../models/cast.model');
const userValidations = async (reqBody)=>{
	let ReligionList = [ "HINDU", "SIKH","BOUDHA", "JAIN","CHRISTIAN","ISLAM", "OTHERS"];
	let DistList = [
        "SRIKAKULAM",
        "VIZIANAGARAM",
        "PARVATIPURAM MANYAM",
		"MANYAM",
        "ANAKAPALLI",
        "ALLURI SITHARAMA RAJU",
        "VISAKHAPATNAM",
        "EAST GODAVARI",
        "KAKINADA",
        "KONASEEMA",
        "WEST GODAVARI",
        "ELURU",
        "KRISHNA",
        "NTR",
        "GUNTUR",
        "BAPATLA",
        "PALNADU",
        "PRAKASAM",
        "SRI POTTI SRIRAMULU NELLORE",
		"SPSR NELLORE",
		"SPS NELLORE",
        "TIRUPATI",
        "CHITTOOR",
        "ANNAMAYYA",
        "YSR KADAPA",
		"YSR",
        "SRI SATHYA SAI",
        "ANANTAPUR",
        "KURNOOL",
        "NANDYAL"
    ];
	let wifevalidAge =await CalculateAge(reqBody.wifeDateofBirth, reqBody.marriageDate);
	let husValidAge = await CalculateAge(reqBody.husbandDateofBirth,reqBody.marriageDate);
	let result={};
	const signs = ['>', '<', `'`, `"`, '%'];
		let regex = /(?=[A-Za-z ]+$).{2,}$/;
		let regexAddress=  /^[A-Za-z0-9 .'/,:/#&-]+$/;
		const caste = await casteList.distinct("subCastName");
		if( reqBody.husbandName == "" || reqBody.husbandCaste == ""  || reqBody.husbandMobile == "" || reqBody.husbandCountry == ""  || reqBody.husbandAddress == "" || reqBody.husbandPermanentAddress == "" || reqBody.husbandFatherName == "" || reqBody.husbandMotherName == "" || reqBody.wifeName == "" || reqBody.husbandReligion == "" || reqBody.wifeReligion == "" || reqBody.wifeCaste == "" || reqBody.wifeDateofBirth == "" || reqBody.wifeMobile == "" || reqBody.wifeMarriageAge == "" || reqBody.wifeFatherName == "" || reqBody.wifeMotherName == "" || reqBody.regDate == "" || reqBody.sroDistrict == "" || reqBody.sroOffice == "" || reqBody.slotTime == "" || reqBody.certificateCopies == 
		"" || reqBody.husbandLengthofResidence == "" || reqBody.husbandOccupation == "" || reqBody.wifeOccupation == "" || reqBody.wifeLengthofResidence == "" ){
			 result.err="Please fill missing fields"; 
			 result.status = false; 
		}
		else if(!regex.test(reqBody.husbandName.trim())){
			result.err="Only Alphabets are allowed(husbandName)";
			result.status = false;
		}
		else if(!regex.test(reqBody.wifeName.trim())){
			result.err = "Only Alphabets are allowed(wifeName)"
			result.status = false;
		}else if(!regex.test(reqBody.husbandFatherName.trim())){
			result.err = "Only Alphabets are allowed(husbandFatherName)"
			result.status = false;
		}
		else if(!regex.test(reqBody.wifeFatherName.trim())){
			result.err = "Only Alphabets are allowed(wifeFatherName)"
			result.status = false;
		}
		else if(!regex.test(reqBody.husbandMotherName.trim())){
			result.err = "Only Alphabets are allowed(husbandMotherName)"
			result.status = false;
		}
		else if(!regex.test(reqBody.wifeMotherName.trim())){
			result.err = "Only Alphabets are allowed(wifeMotherName)"
			result.status = false;
		}
		else if(!caste.includes(reqBody.husbandCaste)){
			result.err = "Invalid Husband Caste"
			result.status = false;
		}
		else if(!caste.includes(reqBody.wifeCaste)){
			result.err = "Invalid Wife Caste"
			result.status = false;
		}
		else if(!ReligionList.includes(reqBody.husbandReligion)){
			result.err="Incorrect husbandReligion";
			result.status = false;
		}else if(!ReligionList.includes(reqBody.wifeReligion)){
			result.err="Incorrect wifeReligion";
			result.status = false;
		} else if(reqBody.husbandDistrict && (reqBody.husbandCountry !== "INDIA" || reqBody.husbandState !== "ANDHRA PRADESH")){
			result.err = "Incorrect husband District";
			result.status = false;
		} else if(reqBody.wifeDistrict && (reqBody.wifeCountry !== "INDIA" || reqBody.wifeState !== "ANDHRA PRADESH")){
			result.err = "Incorrect wife District";
			result.status = false;
		}
		else if(reqBody.husbandCountry == "INDIA" && reqBody.husbandState == "ANDHRA PRADESH" && reqBody.husbandDistrict && !DistList.includes(reqBody.husbandDistrict)){
			result.err="Incorrect husbandDistrict";
			result.status = false;
		}else if( reqBody.wifeDistrict && reqBody.wifeState == "ANDHRA PRADESH" && !DistList.includes(reqBody.wifeDistrict)){
				result.err="Incorrect wifeDistrict";
				result.status = false;
		}else if(reqBody.sroDistrict && !DistList.includes(reqBody.sroDistrict)){
				result.err="Incorrect sroDistrict";
				result.status = false;
		} else if(!reqBody.husbandMarriageAge || typeof reqBody.husbandMarriageAge !== 'number' || reqBody.husbandMarriageAge < 21){
			result.err="husbandAge Should be more than 21";
			result.status = false;
		} else if(!reqBody.wifeMarriageAge || typeof reqBody.wifeMarriageAge !== 'number' ||reqBody.wifeMarriageAge < 18){
			result.err="Wife Age Should be more than 18";
			result.status = false;
		}
		else if(husValidAge < 21){
			
				result.err="husbandAge Should be more than 21";
				result.status = false;
			
		}else if(wifevalidAge < 18){
				result.err="wifeAge Should be more than 18";
				result.status = false;
			
		}else if(reqBody.husbandCountry == "INDIA" && reqBody.husbandState == "ANDHRA PRADESH" && !reqBody.husbandDistrict){
			result.err="husbandDistrict Required";
			result.status = false;
		}else if(reqBody.husbandCountry == "INDIA" &&  reqBody.wifeState == "ANDHRA PRADESH" &&!reqBody.wifeDistrict){
			result.err="wifeDistrict Required";
			result.status = false;
		}
		else if(!reqBody.wifeReligion){
			result.err="wifeDistrict Required";
			result.status = false;
		}
		// else if(reqBody?.transactionAmount < 200){
		// 	result.err="Invalid Transaction Amount";
		// 	result.status = false;
		// } 
		else if(Object.keys(reqBody).filter(o => {
			let flag = false;
			signs.forEach(ob => {
				if(typeof reqBody[o] === 'string' && reqBody[o].includes(ob)){
					flag = true
				}
			})
			return flag
		}).length){
			result.err = `Form fields should not contain any of these special characters [>, <, ', ", %]`;
			result.status = false;
		}
		else{
			result.status = true;
		}
	return result;
}
const axios = require('axios');
// const DIstValidator =async (name)=>{
// 	let axiosREsponse = await axios({method: "get",url: "http://localhost:4002/smr/categories?state=AP"});
// 	let result = axiosREsponse;
// 	console.log("!!!!!!!!!!!!!!!!!!",axiosREsponse);
// 	if(!result.includes(name)){
// 		return false
// 	}else{
// 		return true;
// 	}
	
// }

const CalculateAge =async (birthDate, marriageDate) => {
    const date1 = new Date(birthDate);
    const date2 = new Date(marriageDate);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 365);
  }

module.exports ={userValidations}