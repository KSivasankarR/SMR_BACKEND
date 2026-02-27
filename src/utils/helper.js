const idsModel = require("../services/model/idGenerate");
const mongoose = require("mongoose");
const { MongoGridFSChunkError } = require("mongodb");
const moment = require('moment');
const getValueForNextSequence = async (sequenceOfName) => {
	let data={}
	if (sequenceOfName === "SR") {
		let srNo = await idsModel.findOne({
			sroNumber: sequenceOfName,year:new Date().getFullYear()
		});
		if (srNo === null) {
			data.year = new Date().getFullYear();
			data.sroNumber = sequenceOfName;
			data.sequenceValue= Number(1);
			const resultIds = new idsModel(data);
			await resultIds.save();
			return data.sequenceValue;
		} 
		else {
			const sNo = srNo.sequenceValue;
			const seqNo = Number(sNo) + 1;
			data = await idsModel.findOneAndUpdate(
			{ sroNumber: sequenceOfName },
			{ sequenceValue: seqNo }
			);
			return data.sequenceValue + 1
		}
	  
	}
};

const getNoticeSeqValue = async (seqName)=>{
	let data={}
	if(seqName === "NOTICE"){
		let noticeNo = await idsModel.findOne({
			noticeName: seqName,year:new Date().getFullYear()
		});
		if(noticeNo == null){
			data.year = new Date().getFullYear();
			data.noticeName = seqName;
			data.sequenceValue= Number(1);
			const resultIds = new idsModel(data).save();
			return resultIds.sequenceValue;
		}else{
			const nNo = noticeNo.sequenceValue;
			const seqNo = Number(nNo) + 1;
			data = await idsModel.findOneAndUpdate(
			{ noticeName: seqName },
			{ sequenceValue: seqNo }
			);
			return data.sequenceValue + 1
		}
	}
}

const findOneMethod = async (collectionName, query)=>{
	try{
		const data =await mongoose.connection.db
		.collection(collectionName)
		.findOne(query).then((err,fdata)=>{
			if(err){
				throw err
			}
			return fdata
		})
		return data;
	}catch(ex){
		return ex;
	}
}


const fAndUpdateMethod = async (clName,identify,query)=>{
	try{
		const data =await mongoose.connection.db
		.collection(clName).findOneAndUpdate(identify,{$set:query},{upsert:true}).then((err,fData)=>{
			if(err){
				throw err;
			}
			return fData;
		})
		return data;
	}catch(ex){
		return ex;
	}
}

  
const dateFormat = async (date)=>{
	return moment(date,['YYYY/MM/DD','DD/MM/YYYY','YYYY-MM-DD','DD-MM-YYYY']).format('DD/MM/YYYY')
}

module.exports = { 
  getValueForNextSequence,fAndUpdateMethod,findOneMethod,dateFormat,getNoticeSeqValue
};
