
const Path = require('path');
const {noticePeriodDoc} = require('./pdfStyles/noticePeriod');
const {intendedDeclaration} = require('./pdfStyles/intendedDeclartion');
const {int_Mrg_Certificate} = require('./pdfStyles/int_Mrg_Cer');
const {int_Mrg_Register} = require('./pdfStyles/int_Mrg_register');
const {after_Mrg_Certificate} = require('./pdfStyles/after_Mrg_Cer');
const {after_Mrg_Declaration} = require('./pdfStyles/after_Mrg_Declaration');
const {ackAndSlotStyles} = require('./pdfStyles/ackAndSlot');
const {dataPrintStyles} = require('./pdfStyles/dataPrint');
const moment = require('moment');
const fs = require('fs');
const QRCode = require('qrcode');
const config = require('../config/config');
const logger = require('../config/winston');

const generateReport = async (data,type)=>{
	try{
	// let basePath =`../../public/uploads/${data?._id}`;
		let basePath;
		const checkWifePhoto = fs.existsSync(`./public/uploads/${data?._id}/doc_wifePhoto.png`);
		const checkHusbandPhoto = fs.existsSync(`./public/uploads/${data?._id}/doc_husbandPhoto.png`);
		const checkHusbandSignature = fs.existsSync(`./public/uploads/${data?._id}/doc_husbandSignature.png`);
		const checkWifeSignature = fs.existsSync(`./public/uploads/${data?._id}/doc_wifeSignature.png`);


		if (checkWifePhoto || checkHusbandPhoto || checkHusbandSignature || checkWifeSignature) {
			basePath = `../../public/uploads/${data?._id}`;
		} else {
			basePath = `${process.env.UPLOAD_PATH}/${data?._id}`;
		}
	let d = new Date();
	let AppGenDate = d.getDate().toString().padStart(2, "0")+"/"+(d.getMonth()+1).toString().padStart(2, "0")+"/"+d.getFullYear();
	let[appDate,rest,appYear] = AppGenDate.split("/");
	var monthNames = ["January", "February", "March", "April", "May","June","July", "August", "September", "October", "November","December"];
	let slotDate  =await changeDateFormat(data.slotDate);
	let regDateFormat  =await changeDateFormat(data.regDate);
	let marriageDate  =await changeDateFormat(data.marriageDate);
	let wifeLengthofResidence = await changeDateFormat(data.wifeLengthofResidence);
	let husbandLengthofResidence = await changeDateFormat(data.husbandLengthofResidence);
	let dummyMonth = new Date()
	let appMonth = monthNames[dummyMonth.getMonth()];

    let qrCodeLink = config.SMR_QR_CODE_LINK+ data.applicationId;
	console.log("qrCodeLink ::::: ", qrCodeLink);
	logger.info(`qrCodeLink ::::: ${qrCodeLink}`)                                                                                                                                                
    let qrCodeData = await QRCode.toDataURL(qrCodeLink);
	qrCodeData = qrCodeData.replace('data:image/png;base64,','')
	console.log("qrCodeData ::::: ", qrCodeData);
	logger.info(`qrCodeData ::::: ${qrCodeData}`)                                                                                                                                                
	const imageBuffer = Buffer.from(qrCodeData, 'base64');

	if(type == "notice"){
		
		//let path = Path.resolve(__dirname,"",`${basePath}/doc_wifePhoto.png`);
		let marriedType;
		if(data.mrgType == "AFTER MARRIAGE"){
			marriedType = "MARRIED";
		}else{
			marriedType ="UNMARRIED";
		}

		noticePeriodDoc.content.map((cn)=>{
			if(cn.style =="p1Header"){
				if(data.mrgType =="AFTER MARRIAGE"){
					cn.text = `NOTICE OF AFTER MARRIAGE`;
				}else{
					cn.text = `NOTICE OF INTENDED MARRIAGE`;
				};
			}
			let section = (data.mrgType === "AFTER MARRIAGE") ? 16 : 5;
			// if(fs.existsSync(Path.resolve(`${basePath}/doc_wifePhoto.png`))&& fs.existsSync(Path.resolve(`${basePath}/doc_husbandPhoto.png`))){
			if(checkHusbandPhoto && checkWifePhoto){
				console.log("Valid photos in Directory ::::: ", data?._id);
				logger.info(`Valid photos in Directory ::::: ${data?._id}`)                                                                                                                                                
				if(cn.style == "column1"){
					cn.columns =[
						{
							// image: Path.resolve(__dirname,"",`../../public/uploads/${data?._id}/doc_husbandPhoto.png`),
							// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_husbandPhoto.png`),
							image: Path.resolve(__dirname, `${basePath}/doc_husbandPhoto.png`),
							height: 80,
							width: 70,
							style:'groomImage'
						},
						{text: `THE SECOND SCHEDULE`+'\n'+`(SEE SECTION ${section})`, style:`p1sideHeaders`},
						{
							// image:  Path.resolve(__dirname,"",`../../public/uploads/${data?._id}/doc_wifePhoto.png`),
							// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_wifePhoto.png`),
							image: Path.resolve(__dirname, `${basePath}/doc_wifePhoto.png`),
							height: 80,
							width: 70,
							style:'brideImage'
						},
					]
					console.log(cn.columns);
					logger.info(`columns data ::::: ${JSON.stringify(cn.columns)}`)                                                                                                                                                

				};
			};
			if(cn.style == "tableExample"){
				cn.table = {
					widths: [100, 70, 100, 25,100,100,75],
					body:[
						['NAME', 'CONDITION', 'OCCUPATION', 'AGE','DWELLING PLACE', 'PERMANENT DWELLING','LENGTH OF RESIDENT'],
						[`${data.husbandName.toUpperCase()}`,`${marriedType}`,`${data.husbandOccupation}`,`${data.husbandMarriageAge}`,`${data.husbandAddress}`,`${data.husbandPermanentAddress}`,`${husbandLengthofResidence}`],
						[`${data.wifeName.toUpperCase()}`,`${marriedType}`,`${data.wifeOccupation}`,`${data.wifeMarriageAge}`,`${data.wifeAddress}`,`${data.wifePermanentAddress}`,`${wifeLengthofResidence}`]
					]
				}
			}
			if(checkWifeSignature && checkHusbandSignature){
				console.log("Valid Signatures in Directory ::::: ", data?._id);
				logger.info(`Valid Signatures in Directory ::::: ${data?._id}`)                                                                                                                                                
				if(cn.style =="columns3"){
				
					cn.columns=[
						{
							// image: Path.resolve(__dirname,"",`../../public/uploads/${data?._id}/doc_husbandSignature.png`),
							// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_husbandSignature.png`),
							image: Path.resolve(__dirname, `${basePath}/doc_husbandSignature.png`),
							height: 25,
							width: 60,
							style:"Sign1Image"
						},
						{text:"\nBRIDEGROOM",style:'bdSign'},
						{
							// image: Path.resolve(__dirname,"",`../../public/uploads/${data?._id}/doc_wifeSignature.png`),
							// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_wifeSignature.png`),
							image: Path.resolve(__dirname, `${basePath}/doc_wifeSignature.png`),
							height: 25,
							width: 60,
							style:"Sign2Image",
						},
						{text:`\nBRIDE`,style:'bSign'},
						
						{text:[{text:`MARRIAGE OFFICER`},{text:`\nSub Registrar`,style:{bold:true}},`\n${data.sroName}`],style:'ofcerSign'}

					]

					console.log(cn.columns);
					logger.info(`columns data ::::: ${JSON.stringify(cn.columns)}`)                                                                                                                                                
				}
			}else{
				if(cn.style =="columns3"){
					cn.columns=[
						{text:"BRIDEGROOM",style:'bdSign'},
						{text:`BRIDE`,style:'bSign'},
						{text:[{text:`MARRIAGE OFFICER`},{text:`\nSub Registrar`,style:{bold:true}},`\n${data.sroName}`],style:'ofcerSign'}
					]
				}
			}
			// if(cn.style =="textSign"){
			// 	cn.text = 'sudhakar'.toUpperCase();
			// }
			
		});
		return noticePeriodDoc;
	}
	if(type == "intendedDeclaration"){
		intendedDeclaration.content.map((id)=>{
			if(id.style == 'p1Text'){
				id.text = [
					{text:"I,   "},{text:`             ${data.husbandName.toUpperCase()}            `,style:{decoration:'underline'}},
					{text:"S/O. "},{text:`                 ${data.husbandFatherName.toUpperCase()}               `,style:{decoration:'underline'}},
					{text:"hereby declare as follows :"}
				]
			}
			if(id.style == 'groomAge'){
				id.text= [
					{text:"2. "},{text:`      I have Completed `},
					{text:`           ${data.husbandMarriageAge}           `,style:{decoration:'underline'}},{text:`years of age.`},
				]
			}
			if(id.style == 'groomRelated'){
				id.text= [
					{text:"3. "},{text:`      I am not related to `},
					{text:`                        ${data.wifeName.toUpperCase()}                             `,style:{decoration:'underline'}},{text:`(the bride) within the degrees of `},
				]
			}
			if(id.style == 'p1bride'){
				id.text = [
					{text:"I,   "},{text:`             ${data.wifeName.toUpperCase()}            `,style:{decoration:'underline'}},
					{text:"D/O. "},{text:`                 ${data.wifeFatherName.toUpperCase()}               `,style:{decoration:'underline'}},
					{text:"hereby declare as follows :"}
				]
			}
			if(id.style == 'brideAge'){
				id.text= [
					{text:"2. "},{text:`      I have Completed `},
					{text:`           ${data.wifeMarriageAge}           `,style:{decoration:'underline'}},{text:`years of age.`},
				]
			}
			if(id.style == 'brideRelated'){
				id.text= [
					{text:"3. "},{text:`      I am not related to `},
					{text:`                        ${data.husbandName.toUpperCase()}                             `,style:{decoration:'underline'}},{text:`(the bridegroom) within the degrees of `},
				]
			}
		})
		return intendedDeclaration
	}
	if(type == "intendedCertificate"){
		var [slotDay,slotMonth,slotYear] = slotDate.split("/");
		slotMonth = moment().month(slotMonth-1).format("MMMM");
		var [regDate,regMonth,regYear] = regDateFormat.split("/");
		regMonth = moment().month(regMonth-1).format("MMMM");
		int_Mrg_Certificate.content.map((mc)=>{
			if(mc.style == "column1"){
				mc.columns =[
					{
						image: imageBuffer ,
						height: 80,
						width: 80,
						absolutePosition: { x: 40, y: 40 }
					},
				]
				console.log(mc.columns);
				logger.info(`columns data ::::: ${JSON.stringify(mc.columns)}`)                                                                                                                                                
			};
			if(mc.style == "topHeaderSide1"){
				if(data.noticeSeqNumber == undefined){
					mc.text =""
				}else{
					mc.text = [{text:`Notice No. : `,style:{bold:true}},{text:`${data.noticeSeqNumber}`}]
				}
				
			}
			if(mc.style == "topHeaderSide"){
				mc.text = [{text:`SPL M.C NO. : `,style:{bold:true}},{text:`SMR${new Date().getFullYear()}-${data.sroCode}-${data.cerSequence}`}]
			};
			if(mc.style == "content"){
				mc.text =[
					// {text:`I,  ${data.sroOffice} hereby certify that on the ${slotDay} day of ${slotMonth} ${slotYear} And   ${data.husbandName} ,   ${data.wifeName} appeared  before me and  that  each of them,in  my presence and in the presence of three witnesses who have signed there under made the declarations  required by Section  11 and  that a marriage under this   Act was solemnized between them in my presence.`,style:{alignment:"justify"}}
					{text:"I, "},{text:`${data.sroName}  `,style:{bold:true}},
					{text:`hereby certify that on the `,style:{margin:[0,15,0,0]}},{text:`  ${appDate}  `,style:{margin:[0,15,0,0]}},
					{text:" day of ",style:{margin:[0,15,0,0]}},{text:`  ${appMonth}`,style:{margin:[0,15,0,0]}},{text:""},{text:`,${appYear}  `,style:{margin:[0,15,0,0]}},{text:`And  `,style:{margin:[0,15,0,0]}},{text:`  ${data.husbandName} `,style:{bold:true}}, "and" ,{text:` ${data.wifeName}    `,style:{bold:true}  },{text:`appeared  before me and  that  each of them, in  my presence and `,style:{margin:[0,15,0,0]}},
					{text:`in the presence of three witnesses who have signed thereunder made `,style:{margin:[0,15,0,0]}},
					{text:`the declarations  required by Section  11 and  that a marriage under this`,style:{margin:[0,15,0,0]}},
					{text:`   Act was solemnized between them in my presence.`,style:{margin:[0,15,0,0]}}
				]
			}
			if(mc.style =="ofcSign"){
				
					mc.columns =[
					{text:`Marriage Officer`,style:'ofcerSign'},
					]
				

			}
			if(mc.style =="sro"){
				mc.text=[{text:`Sub Registrar`,style:{bold:true}}, {text:`\n${data.sroName}`}]
			}
			if(mc.style == "column2"){
				mc.columns =[

			{
				// image: Path.resolve(__dirname,"",`../../public/uploads/${data?._id}/doc_husbandPhoto.png`),
				// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_husbandPhoto.png`),
				image: Path.resolve(__dirname, `${basePath}/doc_husbandPhoto.png`),
				height: 100,
				width: 100,
				absolutePosition: { x: 70, y: 420 }
			},
			{
				// image:  Path.resolve(__dirname,"",`../../public/uploads/${data?._id}/doc_wifePhoto.png`),
				// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_wifePhoto.png`),
				image: Path.resolve(__dirname, `${basePath}/doc_wifePhoto.png`),
				height: 100,
				width: 100,
				absolutePosition: { x: 180, y: 420 }
			}
		]}
			if(mc.style =="groomSign"){
				if(checkHusbandSignature){
					mc.columns =[
						{
							// image: Path.resolve(`../../public/uploads/${data?._id}/doc_husbandSignature.png`),
							// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_husbandSignature.png`),
							image: Path.resolve(__dirname, `${basePath}/doc_husbandSignature.png`),
							height: 25,
							width: 60,
							style:"Sign1Image"
						},
						{text:"Groom Signature",style:'bdSign'},
					]
				}else{
					mc.columns =[
					{text:"Groom Signature",style:'bdSign'},
					]
				}

			}
			if(mc.style =="brideSign"){
				if(checkWifeSignature){
					mc.columns =[
						{
							// image: Path.resolve(__dirname,"",`../../public/uploads/${data?._id}/doc_wifeSignature.png`),
							// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_wifeSignature.png`),
							image: Path.resolve(__dirname, `${basePath}/doc_wifeSignature.png`),
							height: 25,
							width: 60,
							style:"Sign2Image",
						},
						{text:`Bride Signature`,style:'bSign'},
						
					]
				}else{
					mc.columns =[
						{text:`Bride Signature`,style:'bSign'},
						
					]
				}

			}
			if(mc.style == "footer"){
				mc.text =[
					{text:"Dated the"},{text:`       ${appDate}      `,style:{decoration:'underline'}}
					,{text:`day of `}, {text:`      ${appMonth} `,style:{decoration:'underline'}},{text:`, ${appYear}  `,style:{decoration:'underline'}}
				]
			}
		})
		return int_Mrg_Certificate;
	}
	if(type == 'intendedRegister'){
		var [slotDay,slotMonth,slotYear] = slotDate.split("/");
		slotMonth = moment().month(slotMonth-1).format("MMMM");
		
		int_Mrg_Register.content.map((mr)=>{
			if(mr.style == "content"){
				mr.text =[
					{text:"I, Sri. "},{text:` ${data.sroOffice}`,style:{decoration:'underline'}},{text:' hereby certify that on '},{text:`    ${slotDay}                 `,style:{decoration:'underline'}},
					{text:'date of '},{text:`  ${slotMonth} `,style:{decoration:'underline'}},{text:`  ,${slotYear}`,style:{decoration:'underline'}},{text:'Sri   .'},{text:`  ${data.husbandName.toUpperCase()} , ${data.wifeName.toUpperCase()}       `,style:{decoration:'underline'}},
					{text:`each of them in my presence of three witnesses,  who have signed here under the declarations required `},{text:'by section 11 and that marriage under this  Act  was solemnized between them in my presence.'}
				]
			};
			if(mr.style == "brAndGroom"){
				mr.columns=[
					{text:'BRIDEGROOM  :',style:{fontSize:10,bold:true}},
					{
						// image: Path.resolve(__dirname,"",Path.resolve(__dirname,"",`${basePath}/doc_husbandSignature.png`)),
						// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_husbandSignature.png`),
						image: Path.resolve(__dirname, `${basePath}/doc_husbandSignature.png`),
						height: 25,
						width: 60,
						style:"Sign3Image"
					},
					
				]
			};
			if(mr.style == "bride"){
				mr.columns=[
					{text:'BRIDE  :',style:{fontSize:10,bold:true}},
					{
						// image: Path.resolve(__dirname,"",Path.resolve(__dirname,"",`${basePath}/doc_wifeSignature.png`)),
						// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_wifeSignature.png`),
						image: Path.resolve(__dirname, `${basePath}/doc_wifeSignature.png`),
						height: 25,
						width: 60,
						style:"Sign2Image"
					},
					
				]
			};
			if(mr.style == "footer"){
				mr.text =[
					{text:"Dated the"},{text:`       ${slotDay}      `,style:{decoration:'underline'}}
					,{text:`day of `}, {text:`      ${slotMonth} `,style:{decoration:'underline'}},{text:`, ${slotYear}  `,style:{decoration:'underline'}}
				]
			}
		})
		return int_Mrg_Register
	}
	if(type == 'afterMrgCertificate'){
		let [slotDay,slotMonth,slotYear] = slotDate.split("/");
		slotMonth = moment().month(slotMonth-1).format("MMMM");
		var [mrgDay,mrgMonth,mrgYear] = marriageDate.split("/");
		mrgMonth = moment().month(mrgMonth-1).format("MMMM");
		var [regDay,regMonth,regYear] = regDateFormat.split("/");
		regMonth = moment().month(regMonth-1).format("MMMM");
		after_Mrg_Certificate.content.map((am)=>{
			if(am.style == "column1"){
				am.columns =[
					{
						image: imageBuffer ,
						height: 80,
						width: 80,
						absolutePosition: { x: 40, y: 40 }
					},
				]
				console.log(am.columns);
				logger.info(`columns data ::::: ${JSON.stringify(am.columns)}`)                                                                                                                                                
			};
			for(let i in am.columns){
				if(am.columns[i].style == "topHeaderSide1"){
					if(data.noticeSeqNumber == undefined){
						am.text =""
					}else{
						am.text = [{text:`Notice No. : `,style:{bold:true}},{text:`${data.noticeSeqNumber}`}]
					}
				}
				if(am.columns[i].style == "topHeaderSide"){
					am.columns[i].text = [{text:`SPL M.C NO. : `,style:{bold:true}},{text:`SMR${new Date().getFullYear()}-${data.sroCode}-${data.cerSequence}`}]
				};
				if(am.columns[i].style == "mrgOfcr"){
					am.columns[i].text =[{text:`MARRIAGE OFFICER`,style:{bold:true}},{text:`\nSub Registrar`,style:{bold:true}},`\n${data.sroName}`] 
				}
			}

			if(am.style == 'content'){
				am.text = [{text:"I S.R.O, "},{text:` ${data.sroName}`,style:{bold:true}},{text:' hereby certify that '},{text:` ${data.husbandName.toUpperCase()}`,style:{bold:true}},{text:' and '},{text:` ${data.wifeName.toUpperCase()}`,style:{bold:true}},{text:' appeared before me this '},{text:` ${regDay}`,style:{bold:true}},{text:' day of '},{text:`  ${regMonth}, ${regYear}`,style:{bold:true}},{text:' and that each of them in my presence and in the presence of three witnesses who have signed hereunder , have declared that a ceremony of marriage has been performed between them and that they have been living together as husband and wife since the time of their marriage registered under this Act, the said marriage has this '},{text:`  ${appDate}`,style:{bold:true}},{text:' day of '},{text:` ${appMonth}, ${appYear}`,style:{bold:true}},{text:' been registered under this Act, having effect as from '},{text:` ${mrgDay}`,style:{bold:true}},{text:' day of '},{text:` ${mrgMonth}, ${mrgYear}.`,style:{bold:true}}]
			};
			// if(am.style =="content2"){

			// 	am.text = [
			// 		{text:'and '},
			// 		{
			// 			text:`   ${data.wifeName.toUpperCase()}      `,style:{decoration:'underline'}
			// 		},
			// 		{
			// 			text:'appeared before me this'
			// 		},
			// 		{
			// 			text:` ${regDay}`,style:{decoration:'underline'}
			// 		},
			// 		{
			// 			text:' day of '
			// 		},
			// 		{
			// 			text:` ${regMonth}, ${regYear} `,style:{decoration:'underline'}
			// 		},
			// 		{
			// 			text:'and that each of them in my  presence and in the  presence of three witnesses who have signed hereunder , have'
			// 		},
			// 		{
			// 			text:' declared that a ceremony of marriage has been performed between them and that they have been living together'
			// 		},
			// 		{
			// 			text:' as husband and wife since the time of their marriage registered  under this Act,  the said marriage has this'
			// 		},
					
			// 		{text:` ${appDate} `,style:{decoration:"underline"}},{text:'day of '},
			// 		{text:` ${appMonth},`,style:{decoration:"underline"}},{text:''},
			// 		{text:` ${appYear} `,style:{decoration:"underline"}},{text:'been registered under this Act, having effect as from '},{text:`     ${mrgDay}      `,style:{decoration:"underline"}},{text:` day of `},
			// 		{text:`   ${mrgMonth},`,style:{decoration:"underline"}},{text:""},
			// 		{text:`        ${mrgYear}  `,style:{decoration:"underline"}},"."
			// 	]
			// }
			if(am.style == "signcolumns"){
				am.columns=[
					{text:'1).'+'\n'+'\n'+'\n'+
				'2). '+'\n'+'\n'+'\n'+
				'3). ',style:'witnesses'},
				{
					// image: Path.resolve(__dirname,"",`../../public/uploads/${data?._id}/doc_husbandPhoto.png`),
					// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_husbandPhoto.png`),
					image: Path.resolve(__dirname, `${basePath}/doc_husbandPhoto.png`),
					height: 100,
					width: 100,
					style:'groomImage'
				},
				{
					// image:  Path.resolve(__dirname,"",`../../public/uploads/${data?._id}/doc_wifePhoto.png`),
					// image: Path.resolve(process.env.UPLOAD_PATH, `${data?._id}/doc_wifePhoto.png`),
					image: Path.resolve(__dirname, `${basePath}/doc_wifePhoto.png`),
					height: 100,
					width: 100,
					style:'brideImage'
				},
				{text:`for     ${data.sroDistrict}       District`+'\n'+'\n'+'\n'+
				'Husband:'+'\n'+'\n'+'\n'+
				'Wife:',style:'sign'}
				]
		 }			
			if(am.style == "footer"){
				am.text =[
					{text:"Dated the"},{text:`         ${appDate}               `,style:{decoration:'underline'}}
					,{text:`day of `}, {text:`         ${appMonth}  `,style:{decoration:'underline'}},
					{text:``},{text:` ,${appYear}          `,style:{decoration:'underline'}}
				]
			}
		})
		return after_Mrg_Certificate
	};
	if(type == 'afterMrgDeclaration'){
		// let husPermanent;
		// if(data.husbandPermanentAddress != undefined){
		// 	husPermanent = data.husbandPermanentAddress.split(",")
		// }else{
		// 	husPermanent ="";
		// }
		
		
		after_Mrg_Declaration.content.map((amd)=>{
			for(let i in amd.columns){
				if(amd.columns[i].style =="p2NameValue"){
					amd.columns[i].text = `${data.husbandName.toUpperCase()}  (Husband)`+'\n'+'\n'+`${data.wifeName.toUpperCase()}  (Wife)`
				}
				if(amd.columns[i].style =="p2AgeValue")
					amd.columns[i].text = `${data.husbandMarriageAge}  (Husband)`+'\n'+'\n'+`${data.wifeMarriageAge}  (Wife)`;
				if(amd.columns[i].style =="p2PAdress1Value"){
					
					// data.husbandPermanentAddress = ""
					amd.columns[i].text = `${data.husbandPermanentAddress}`+'\n'+'\n'+`${data.wifePermanentAddress}`;
				}
					
				if(amd.columns[i].style =="p2PAdress2Value")
					amd.columns[i].text = `${data.husbandAddress} `+'\n'+'\n'+`${data.wifeAddress}`;
				if(amd.columns[i].style =="p2text1")
					amd.columns[i].text = [
						{text:`6. A Ceremoney of marriage was performed between`},{text:`\n                          ${data.husbandName.toUpperCase()}                        `,style:{decoration:"underline",margin:[50,0,0,0]}},{text:' and '},{text:`               ${data.wifeName}                           `,style:{decoration:"underline"}}
					]
			}
			if(amd.style =="p2text1"){
				amd.text = [
					{text:`6. A Ceremoney of marriage was performed between`},{text:"\n "},{text:`                             ${data.husbandName.toUpperCase()}                           `,style:{decoration:"underline"}},{text:'  and   '},{text:`               ${data.wifeName}                                     `,style:{decoration:"underline"}},{text:"\non "},{text:`                             ${marriageDate}                           `,style:{decoration:"underline"}},
					{text:'  at   '},{text:`               ${data.marriedAddress}                                   `,style:{decoration:"underline"}},{text:'\nwe declare that we have been living together as husband and wife over/since the date noted above.'}
				]
			}
			if(amd.style =="sro"){
				amd.text = [
					{text:`v)       We have been residing within jurisdiction of the marriage officer  at`},{text:`                ${data.sroOffice.toUpperCase()}                   `,style:{decoration:"underline"}},
				]
			}
			// amd.columns.map((cm)=>{
			// 	console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$",cm.style);
			// 	// if(cm.style =="p2NameValue"){
			// 	// 	cm.text = `${data.husbandName}  (Husband)`+'\n'+`${data.wifeName}  (Wife)`
			// 	// }
			// })

		})
		return after_Mrg_Declaration;
	};

	if(type == 'acknowledgement'){
			ackAndSlotStyles.watermark.text ="SPECIAL MARRIAGE"
		let ackTable ={
			widths:[450],
			body:[
				[	{	
						columns:[
							{
								text:"Application Number  ",fontSize:12,bold:true,alignment:'right',margin:[20,10,-50,0]
							},
							{
								text:" : ",alignment:"center",margin:[0,10,0,0]
							},
							{text:`  ${data.applicationId}`,fontSize:12,alignment:'left',margin:[-50,10,0,0]}
						]
						
					}
					// {text:"Application ID:",fontSize:13,bold:true,alignment:'right',margin:[0,10,0,0]},{text:`${data.applicationId}`,fontSize:12,alignment:'left',margin:[0,10,0,0]}
				],
				[
					{
						columns:[
							{
								text:"Bride Name  ",fontSize:12,bold:true,alignment:'right',margin:[20,10,-50,0]
							},
							{
								text:" : ",alignment:"center",margin:[0,10,0,0]
							},
							{text:`  ${data.wifeName}`,fontSize:12,alignment:'left',margin:[-50,10,0,0]}
						]
					}
				],
				[
					{
						columns:[
							{
								text:"Groom Name  ",fontSize:12,bold:true,alignment:'right',margin:[20,10,-50,0]
							},
							{
								text:" : ",alignment:"center",margin:[0,10,0,0]
							},
							{text:`  ${data.husbandName}`,fontSize:12,alignment:'left',margin:[-50,10,0,0]}
						]
					}
				],
				[
					{
						columns:[
							{
								text:"Sub Registrar Office  ",fontSize:12,bold:true,alignment:'right',margin:[20,10,-50,0]
							},
							{
								text:" : ",alignment:"center",margin:[0,10,0,0]
							},
							{text:`  ${data.sroOffice}`,fontSize:12,alignment:'left',margin:[-50,10,0,0]}
						]
					}
				],
				[
					{
						columns:[
							{
								text:"Slot Date, Time",fontSize:12,bold:true,alignment:'right',margin:[20,10,-50,0]
							},
							{
								text:" : ",alignment:"center",margin:[0,10,0,0]
							},
							{text:`  ${slotDate}, ${data.slotTime}`,fontSize:12,alignment:'left',margin:[-50,10,0,0]}
						]
					}
				]
			]
		}
		ackAndSlotStyles.content.map((ac)=>{
			if(ac.style ==="table1")
				ac.table = ackTable;
		})
		return ackAndSlotStyles;
	}
	if(type =='smrData'){
		ackAndSlotStyles.watermark.text ="SPECIAL MARRIAGE"
		dataPrintStyles.content.map((cn)=>{
			for(let i in cn.columns){
				if(cn.columns[i].style =='appNo'){
					cn.columns[i].text = [{text:'Application Ref No.  :',},{text:``,bold:true}];
				}
				if(cn.columns[i].style =='date'){
					cn.columns[i].text = [{text:'Date  :',},{text:``,bold:true}];
				}
			}
			let dTable ={
				widths:[100,200,150],
				body:[
					[{text:"",fillColor:"#cacaca"},{text:"Bride Details",alignment:'center',fillColor:"#cacaca"},{text:"Groom Details",alignment:'center',fillColor:"#cacaca"}],
					[{text:'Name Before Marriage',alignment:'left',fontSize:8,margin:[0,5,0,5]},{text:`${data.wifeName}`,alignment:'left',fontSize:8,margin:[0,5,0,5]},{text:`${data.husbandName}`,alignment:'left',fontSize:8,margin:[0,5,0,5]}],
					[{text:'Name After Marriage',alignment:'left',fontSize:8,margin:[0,5,0,5]},{text:`${data.wifeName}`,alignment:'left',fontSize:8,margin:[0,5,0,5]},{text:`${data.husbandName}`,alignment:'left',fontSize:8,margin:[0,5,0,5]}],

					[{text:'Religion (Caste)',alignment:'left',fontSize:8,margin:[0,5,0,5]},{text:`${data.wifeReligion} (${data.wifeCaste})`,alignment:'left',fontSize:8,margin:[0,5,0,5]},{text:`${data.husbandReligion} (${data.husbandCaste})`,alignment:'left',fontSize:8,margin:[0,5,0,5]}],

					[{text:'Permanent Address',alignment:'left',fontSize:8,margin:[0,5,0,5]},{text:`${data.wifeReligion} (${data.wifeCaste})`,alignment:'left',fontSize:8,margin:[0,5,0,5]},{text:`${data.husbandReligion} (${data.husbandCaste})`,alignment:'left',fontSize:8,margin:[0,5,0,5]}],

				]
			}
			if(cn.style =="table1"){
				cn.table = dTable;
			}
		})
		return dataPrintStyles;

	}
}catch(ex)
{
	console.log(ex);
	logger.error(" Error :: ", ex);
	console.log(" Error :: ", ex);
}
}

async function changeDateFormat(date){
	let x = new Date(date);
	return x.getDate()+'/'+("0"+(x.getMonth() + 1)).slice(-2)+'/'+x.getFullYear();
}

module.exports = {generateReport}