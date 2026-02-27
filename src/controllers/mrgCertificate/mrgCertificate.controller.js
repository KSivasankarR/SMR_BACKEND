
const fs = require('fs');
const Path = require('path');
const pdfMake = require('pdfmake');
const usersModel = require('../../models/users.model');
const officerModel = require('../../models/officer.model');
const {generateReport} = require('../../utils/pdfGenerator');
const sequenceModel = require('../../models/sequence');
const dbHelper = require('../../utils/helper');
const sysConstanst = require('../../utils/sysConstanst');
const { ObjectId } = require('mongodb');
const { encryptData } = require('../../services/auth.service');

const https = require('https');
const axios = require("axios");
const CryptoJs = require('crypto-js');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const fsone = require("fs");
const { PDFDocument } = require('pdf-lib');
const logger = require('../../config/winston');
const fs1 = require('fs').promises;
//let sroNumberList = [];

const instance = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    })
});

var fonts = {
	Roboto: {
	  normal:
		"node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf",
	  bold: "node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf",
	  italics:
		"node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf",
	  bolditalics:
		"node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf",
	}
};
exports.splMrgPdf = async (req,res)=>{
	try{
		const reqParams = req.params;
		const reqBody = req?.body;
		// const path = Path.join(__dirname, `../../../pdf/`);
		const path = process.env.PDF_PATH;
		if(!fs.existsSync(path)){
			fs.mkdirSync(path);
		}
		let getData =""
		let setcertFromSRO="";
		if(reqParams.type == "intendedDeclaration" || reqParams.type == "afterMrgDeclaration"){
			if(checkIfVerifiedExists(reqBody, reqParams.type)){
				getData = reqBody;
			}
			else{
				return res.status(400).send({Success:false,message:'Bad request'})
			}
		}else{
			
			if(!reqParams.applicationId){
				return res.status(400).send({Success:false,message:'Bad Request,ApplicationId is Missing'})
			}
			getData = await usersModel.findOne({applicationId:reqParams.applicationId});
			logger.info(`getData for user ::::: ${getData}`)                                                                                                                                             
			let sroDetails = await officerModel.findOne({sroDistrict:getData.sroDistrict,sroOffice:getData.sroOffice});
			logger.info(`sroDetails ::::: ${sroDetails}`)                                                                                                                                             
			
			getData.sroCode = sroDetails.sroNumber;
			getData.sroName = sroDetails.sroName;
			let sequenceData =await sequenceModel.findOne({sroNumber:getData.sroNumber});
			logger.info(`sequenceData ::::: ${sequenceData}`)                                                                                                                                             
			if(reqParams.type =="intendedCertificate" || reqParams.type =="afterMrgCertificate"){
				let addSq;
				if(getData.cert_form == false){
					if(sequenceData.cer_sequence == undefined || sequenceData.cer_sequence == null){
						addSq = await sequenceModel.findOneAndUpdate({"sroNumber":getData.sroNumber},{$set:{cer_sequence: 1}});
					}else{
						addSq = await sequenceModel.findOneAndUpdate({"sroNumber":getData.sroNumber},{$set:{cer_sequence:sequenceData.cer_sequence+1}});
					};
					getData.cerSequence = addSq.cer_sequence == undefined ? 1 : addSq.cer_sequence+1;
					let query ={cert_form:true,"cerSequence":getData.cerSequence}
					await  dbHelper.fAndUpdateMethod(sysConstanst.Col_users,{applicationId:reqParams.applicationId},query);
				}
			}
		}
		if(getData.cert_form == true){
			let fileName = reqParams.type+ `_${reqParams.applicationId}`;
			logger.info(`fileName ::::: ${fileName}`)                                                                                                                                             
			const bitmap = fs.readFileSync(`${path}/${fileName}.pdf`);
			let convertBase64 = bitmap.toString('base64');
			// return({status:200,Success:true,Url:getData.cert_url})
			return res.status(200).send({
				Success:true,
				Url: `${fileName}.pdf`,dataBase64:convertBase64, fileName:fileName+'.pdf'
			})
		}else{
			const finalReport = await generateReport(getData,reqParams.type);
			logger.info(`finalReport ::::: ${JSON.stringify(finalReport)}`)                                                                                                                                             
			let pdf = new pdfMake(fonts);
			let pdfDoc = pdf.createPdfKitDocument(finalReport,{});
			let fileName;
			if(reqParams.applicationId){
				fileName = reqParams.type+ `_${reqParams.applicationId}`
			}else{
				fileName = reqParams.type
			}
			let pdfFilePath = `${path}/${fileName}.pdf`;
			pdfDoc.pipe(fs.createWriteStream(pdfFilePath));
			pdfDoc.end();
			if((reqParams.type == "intendedCertificate" || reqParams.type == "afterMrgCertificate") && getData.cert_form == false ){
				await usersModel.findOneAndUpdate({_id: getData._id},{$set:{cert_url: `pdfs/${fileName}.pdf`}});
				setTimeout(() => {
					const bitmap = fs.readFileSync(`${path}/${fileName}.pdf`);
				let convertBase64 = bitmap.toString('base64');
				return res.status(200).send({
					Success:true,
					Url: `${fileName}.pdf`,dataBase64:convertBase64, fileName:fileName+'.pdf'
				})
				}, 2000)
			}else{
				let bitmap;
				
				setTimeout(()=>{
					bitmap = fs.readFileSync(`${path}/${fileName}.pdf`);
					let convertBase64 = bitmap.toString('base64');
					return res.status(200).send({
						Success:true,
						Url: `${fileName}.pdf`,dataBase64:convertBase64, fileName:fileName+'.pdf'
					})
				},1000)
			}

		}
	}catch(ex){
		logger.error("error :::",ex)
		return res.status(500).send({Success:false,message:'Internal Server Problem'})
		
	}
};

const encryptWithAESPassPhrase = (originalText, passphrase) => {
	const encryptedText = CryptoJs.AES.encrypt(originalText, passphrase).toString();
	return encryptedText;
};

const igrsEsignAxiosCall = async (eSignUrl, eSignData) => {
    try {
        let data = JSON.stringify({
            "esignRequest": eSignData
        });

        let eSignConfig = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${eSignUrl}/storeAndProcessEsignRequest`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        };

        let fileResponse = await instance.request(eSignConfig);

        if (fileResponse == null || fileResponse.data == null) {
            throw new Error('SMR Esign API error');
        }
        return fileResponse.data;
    } catch (ex) {
        console.error("ESignServices - SMR EsignAxiosCall || Error:", ex.message);
        throw ex;
    }
};

const extractTextWithPositionsFromPDF = async (pdfFilePath) => {
    const data = new Uint8Array(fsone.readFileSync(pdfFilePath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
 
    let textWithPositions = [];
 
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      content.items.forEach((item) => {
        textWithPositions.push({
          text: item.str,
          position: {
            x: item.transform[4],
            y: item.transform[5],
          },
          page: i,
        });
      });
    }
 
    return textWithPositions;
  };
 

exports.EsignCoordinates = async (req, res) => {
	const { registrationNumber, aadhar, aadharname, search, flag, path } = req.query;

	try {
		const userDataArray = await usersModel.find({ applicationId: registrationNumber });
		logger.info(`userDataArray ::::: ${userDataArray}`)                                                                                                                                             
		if (!userDataArray.length) {
			return res.status(404).json({ message: 'User data not found' });
		}

		const userData = userDataArray[0];

		let fileName;
		if (userData.mrgType) {
			fileName = `${userData.mrgType.includes('INTENDED') ? 'intendedCertificate' : 'afterMrgCertificate'}_${userData.applicationId}`;
		} else {
			return res.status(400).json({ message: 'Marriage type not found in user data' });
		}

		// const filePath = Path.join(__dirname, '../../../pdf', `${fileName}.pdf`);
		const filePath = `${process.env.PDF_PATH}/${fileName}.pdf`;
		logger.info(`filePath ::::: ${filePath}`)                                                                                                                                             

		if (!fs.existsSync(filePath)) {
			return res.status(404).json({ message: 'PDF file not found' });
		}

		const pdfBuffer = await fs.promises.readFile(filePath);
		const pdfData = new Uint8Array(pdfBuffer);

		const pdfDocument = await pdfjsLib.getDocument({ data: pdfData }).promise;
		logger.info(`pdfDocument ::::: ${pdfDocument}`)                                                                                                                                             
		const totalPages = pdfDocument.numPages;
		const lastPage = await pdfDocument.getPage(totalPages);

		const textWithPositions = await extractTextWithPositionsFromPDF(filePath);
		const searchTextArray = search.includes(',') ? search.split(',') : [search];

		// const signaturePosition = textWithPositions.filter(item =>
		// 	searchTextArray.some(text => item.text.includes(text))
		// );

		const signaturePosition = textWithPositions.filter(item =>
			searchTextArray.some(text =>
				item.text.toLowerCase().includes(text.toLowerCase().trim())
			)
		);
		logger.info(`signaturePosition ::::: ${signaturePosition}`)                                                                                                                                             

		if (!signaturePosition.length) {
			return res.status(404).json({ message: 'No matching text found for eSign' });
		}

		const transactionID = "SMC" + userData.sroNumber + Date.now(); 
		logger.info(`transactionID ::::: ${transactionID}`)                                                                                                                                                

		const getCoordinates = (role) => {
			const pos = signaturePosition[0].position;
			const page = signaturePosition[0].page;

			switch (role) {
				case 'husband':
					return userData.mrgType.includes('INTENDED')
						? `${page}-${Math.max(0, Math.round(pos.x - 265))},${Math.round(pos.y + 5)},50,150;`
						: `${page}-${Math.max(0, Math.round(pos.x - 540))},${Math.round(pos.y - 25)},50,150;`;
				case 'wife':
					return userData.mrgType.includes('INTENDED')
						? `${page}-${Math.max(0, Math.round(pos.x - 265))},${Math.round(pos.y + 5)},50,150;`
						: `${page}-${Math.max(0, Math.round(pos.x - 540))},${Math.round(pos.y - 25)},50,150;`;

				case 'witness1':
				case 'witness2':
				case 'witness3':
					return userData.mrgType.includes('INTENDED')
						? `${page}-${Math.max(0, Math.round(pos.x - 245))},${Math.round(pos.y - 25)},50,150;`
						: `${page}-${Math.max(0, Math.round(670 - (pos.x - 10)))},${Math.round(pos.y - 25)},50,150;`;
				case 'sro':
					// if (signaturePosition.length >= 2) {
					// 	return [`${page}-${Math.max(0, Math.round(pos.x - 610))},${Math.round(pos.y + 5)},50,150;`].join('');
					// }
					return userData.mrgType.includes('INTENDED')
					? `${page}-${Math.max(0, Math.round(pos.x - 315))},${Math.round(pos.y + 5)},50,150;`
					: `${page}-${Math.max(0, Math.round(pos.x - 610))},${Math.round(pos.y + 5)},50,150;`;
			}
		};

		const coOrdinatesVal = getCoordinates(flag);
		const base64Pdf = pdfBuffer.toString('base64');

		const eSignData = {
			rrn: transactionID,
			coordinates_location: 'Top_Right',
			coordinates: coOrdinatesVal,
			doctype: 'PDF',
			uid: aadhar,
			signername: aadharname?.substring(0, 50),
			signerlocation: userData.sroOffice? userData.sroOffice:'SRO',
			filepassword: '',
			signreason: 'MarriageCertificateSign',
			authmode: 2,
			webhookurl: path,
			file: base64Pdf
		};
		logger.info(`eSignData ::::: ${eSignData}`)                                                                                                                                                

		const esignRequestData = encryptWithAESPassPhrase(JSON.stringify(eSignData), "igrsSecretPhrase");
		const eSignResponse = await igrsEsignAxiosCall(process.env.Esign_URL, esignRequestData);
		logger.info(`eSignResponse ::::: ${JSON.stringify(eSignResponse)}`)                                                                                                                                                

		if (eSignResponse.status === 'Success') {
			let updateFields = {};
			if (aadhar && aadhar.length === 12 && /^\d{12}$/.test(aadhar)) {
				const encryptedAadhar = encryptData(aadhar);
					switch (flag) {
						case 'husband':
							updateFields = { husbandeSignAadhar: encryptedAadhar, husbandeSignTranId : transactionID };
							break;
						case 'wife':
							updateFields = { wifeeSignAadhar: encryptedAadhar, wifeeSignTranId : transactionID};
							break;
						case 'witness1':
							updateFields = { witness1Aadhar: encryptedAadhar, witness1Name: aadharname, witness1eSignTranId : transactionID  };
							break;
						case 'witness2':
							updateFields = { witness2Aadhar: encryptedAadhar, witness2Name: aadharname, witness2eSignTranId : transactionID };
							break;
						case 'witness3':
							updateFields = { witness3Aadhar: encryptedAadhar, witness3Name: aadharname, witness3eSignTranId : transactionID };
							break;
						case 'sro':
							updateFields = { sroAadhar: encryptedAadhar, srName: aadharname, sroeSignTranId : transactionID };
							break;
					}
			
					await usersModel.findOneAndUpdate(
						{ applicationId: registrationNumber },
						{ $set: updateFields },
						{ new: true }
					);
			}
		}

		return res.status(200).json({ rrn: transactionID, data: eSignResponse });

	} catch (err) {
		logger.error("error :::",err)
		console.error("Error in SMR Esign:", err);
		return res.status(500).json({ message: "Error processing eSign", error: err.message });
	}
};

  



const convertBase64ToPdf = async (base64String) => {
    const decodedBuffer = Buffer.from(base64String, 'base64');
    const pdfDoc = await PDFDocument.load(decodedBuffer)
    return pdfDoc.save();
}


const savePdfToFile = async (pdfBytes, filePath) => {
    await fs1.writeFile(filePath, pdfBytes);
    return true;
};


exports.pendingEsign = async (req, res) => {
	try {
		const { registrationNumber, esignstatus } = req.query;
		if (esignstatus && esignstatus !== 'null') {
			const base64String = Buffer.from(esignstatus).toString('base64');
			const eSignConfig = {
				method: "post",
				maxBodyLength: Infinity,
				url: `${process.env.Esign_URL}/downloadSignedDocTransID?transactionId=${base64String}`,
				headers: {
					"Content-Type": "application/json",
				},
				httpsAgent: new https.Agent({  
					rejectUnauthorized: false
				})
			};

			const fileResponse = await axios(eSignConfig);

			if (fileResponse == null || fileResponse.data == null || fileResponse.data.data === undefined) {
				return res.status(400).json({ message: 'eSign not completed'});
			} else {
				const base64Pdf = fileResponse.data.data;
				const pdfBytes = await convertBase64ToPdf(base64Pdf);
				const userDataArray = await usersModel.find({ applicationId: registrationNumber });
				if (!userDataArray.length) {
					return res.status(404).json({ message: 'User data not found' });
				}

				let userData = userDataArray[0];
				logger.info(`userData ::::: ${userData}`)                                                                                                                                                

				
		let fileName;
		if (userData.mrgType) {
			fileName = `${userData.mrgType.includes('INTENDED') ? 'intendedCertificate' : 'afterMrgCertificate'}_${userData.applicationId}`;
		} else {
			return res.status(400).json({ message: 'Marriage type not found in user data' });
		}

				if (userData.cert_form === true) {
					// filePath = Path.join(__dirname, '../../../pdf', `${fileName}.pdf`);
				    filePath = `${process.env.PDF_PATH}/${fileName}.pdf`;

				}
				await savePdfToFile(pdfBytes, filePath)
				let updateFields = {};

if (userData.husbandeSignAadhar) updateFields.husbandeSignStatus = true;
if (userData.wifeeSignAadhar) updateFields.wifeeSignStatus = true;
if (userData.witness1Aadhar) updateFields.witness1eSignStatus = true;
if (userData.witness2Aadhar) updateFields.witness2eSignStatus = true;
if (userData.witness3Aadhar) updateFields.witness3eSignStatus = true;
if (userData.sroAadhar) updateFields.sroeSignStatus = true;

await usersModel.updateOne({ applicationId: registrationNumber }, { $set: updateFields });
				return res.status(200).json({ message: "eSign completed successfully", status: esignstatus});
			}
		} else {
			return res.status(400).json({ message: "Invalid eSign status", status: esignstatus });
		}
	} catch (err) {
		logger.error("error ::",err)
		console.error("Error in SMR Esign:", err);
		return res.status(500).json({ message: "Error processing eSign", error: err.message });
	}
};



const checkIfVerifiedExists = (Obj, type) => {
	let flag = true;
	if(Obj && Object.keys(Obj).length){
		if(type === 'afterMrgDeclaration'){
			let initialAfterObj = {"husbandMarriageAge": 0, "wifeMarriageAge": 0, "husbandName":"", "wifeName":"", "husbandFatherName":"", "wifeFatherName":"","marriageDate":"","marriedAddress":"","sroOffice":"","sroMandal":"","regDate":"","husbandAddress":"","husbandPermanentAddress":"","wifeAddress":"","wifePermanentAddress":"","type":"afterMrgDeclaration"};
			for(let i in initialAfterObj){
				if(!Obj[i] || (typeof initialAfterObj[i] !== typeof Obj[i]) || ['<', '>', '%', `'`, `"`].filter(str => typeof Obj[i] === 'string' && Obj[i].includes(str)).length){
					flag = false;
					break;
				} else if((i === 'husbandMarriageAge' || i === 'wifeMarriageAge') && Obj[i] < 21){
					flag = false;
					break;
				}
				initialAfterObj[i] = Obj[i];
			}
		} else {
			let initialIntendedObj = {"husbandMarriageAge": 0,"wifeMarriageAge":0,"husbandName":"","wifeName":"","husbandFatherName":"","wifeFatherName":"","type":"intendedDeclaration"};
			for(let i in initialIntendedObj){
				if(!Obj[i] || (typeof initialIntendedObj[i] !== typeof Obj[i]) || ['<', '>', '%', `'`, `"`].filter(str => typeof Obj[i] === 'string' && Obj[i].includes(str)).length){
					flag = false;
					break;
				} else if((i === 'husbandMarriageAge' && Obj[i] < 21) || (i === 'wifeMarriageAge' && Obj[i] < 18)){
					flag = false;
					break;
				}
				initialIntendedObj[i] = Obj[i];
			}
		}
	}
	else{
		flag = false
	}
    return flag
};


exports.downloadDocument = async (req,res)=>{
	try{
		
		const reqParams = req.params;
		let docType = reqParams.docType;
		let appNoVal = reqParams.appNo;

		const userDataArray = await usersModel.find(reqParams.type === 'applicationId' ? { applicationId: appNoVal} : {_id: ObjectId(appNoVal)});

		console.log(" userDataArray :::: ", userDataArray)
		logger.info(`userDataArray ::::: ${userDataArray}`)                                                                                                                                                

		let userData = userDataArray[0];
		if(docType === 'doc_docForm' )
		{
			if(userData.cert_form === true)
			{
				let certUrl = userData.cert_url;
				let docFormPdf = (certUrl.split("pdfs/"))[1];
				logger.info(`docFormPdf ::::: ${docFormPdf}`)                                                                                                                                                
				// const path = Path.join(__dirname, "../../" + "pdf/"+docFormPdf);
				const bitmap = fs.readFileSync(docFormPdf);
				// const bitmap = fs.readFileSync(path);
				let convertBase64 =  bitmap.toString('base64');
				return res.status(200).send({
					Success:true,
					dataBase64:convertBase64,
					fileName: docFormPdf
				});
			}
			else
				return res.status(404).send({
					Success:false,
					message:"File not found in server."
				});
		}
		else
		{
			let documentsArray = userData.documents;
			logger.info(`documentsArray ::::: ${documentsArray}`)                                                                                                                                                
			var docPath;
			var docFileName;
			for(var i=0;i<documentsArray.length;i++)
			{
				let document = documentsArray[i];
				if(docType === document.fileName)
				{
					docPath = document.filePath;
					let docPathArray = docPath.split(".");
					docFileName = document.fileName+"."+docPathArray[docPathArray.length-1];
					break;
				}else if(docType === document.fieldname){
					docPath = document.filePath;
					let docPathArray = docPath.split(".");
					docFileName = document.fileName+"."+docPathArray[docPathArray.length-1];
				}
			}
			if(docPath!=undefined)
			{
				// const path = Path.join(__dirname, "../../../" + docPath);
				if(docPath.indexOf("/marriages/") == -1){
					docPath = process.env.UPLOAD_PATH + userData._id + '/' + docFileName;
				}
			    const bitmap = fs.readFileSync(docPath);
				// const bitmap = fs.readFileSync(path);
				let convertBase64 = bitmap.toString('base64');
				return res.status(200).send({
					Success:true,
					dataBase64:convertBase64,
					fileName: docFileName
				});
			}
			else
				return res.status(404).send({
					Success:false,
					message:"File not found in server."
				});
		}
	}catch(ex){
		logger.error(" error ", ex);
		console.log(" error ", ex);
		return res.status(500).send({Success:false,message:'Internal Server Problem'})
	}
}
