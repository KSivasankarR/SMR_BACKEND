const Path =require('path');
let noticePeriodDoc = {
   background:  ()=> {
	   return [
		   {
			   canvas: [

				   {type: 'rect',x: 9,y: 9,w: 580,h: 827,r: 4,lineColor: 'black'},
				   {type: 'rect',x: 12,y: 12,w: 574,h: 821,r: 2,lineColor: 'grey'}
			   ],

		   }
	   ]
   },
   pageOrientation: 'landscape',
   content: [
	   {
		   text: `NOTICE OF INTENDED MARRIAGE`, style:'p1Header',			
	   },

	   {
		   columns:[],
		   style:"column1"
	   },
	   { text: `To,`+'\n'+`THE MARRIAGE OFFICER`, style:`p1Adress`},
	   {
		   columns:[
			   {text:"FOR THE",style:'p1Name'},
			   {text:"DISTRICT",style:'p1Dist'}
		   ]
	   },
	   {text:`We hereby give you notice that a marriage under the Special Marriage ACT, 1954 is intended to be solemnized between us within three calendar months from the date hereof.`,style:'p1Text'},
	   {
		   style: 'tableExample',
		   heights: 20,
		//    widths: [200, 100, 200, 100,200,200,100],
		   table: {
		   }

	   },
	   {
		   columns:[
			   {text:"Witness our hands this",style:'p1PostTable1'},
			   {text:`20          There is no prohibit relationship between us.`,style:'p1PostTable2'}
		   ]
	   },
	   {
		   columns:[],
		   style:"columns3"

	   },

	   {
		   
		   columns:[
			   {text:"",style:'bdSign'},
			   {text:``,style:'bSign'},
			   {text:``,style:'ofcerSign'}
		   ]
			   
		   
	   },

	   
   ],

   
   
   styles: {
	   p1Header: {
		   
		   alignment: 'center',
		   fontSize: 12,
		   fontFamily:'segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif;',
		   bold: true,
		   decoration:'underline',
		   margin: [-20, -20, 0, 20]
	   },
	   p1sideHeaders: {
		   
		   alignment: 'center',
		   fontSize: 10,
		   margin: [-20, -20, 0, 20]
		   
	   },
	   p1Adress:{
		   alignment: 'left',
		   fontSize: 9,
		   margin: [10, 20, 0, 20]
	   },
	   groomImage:{
		   alignment:'left',
		   margin: [20, -20, 0, 20]
	   },
	   brideImage:{
		   alignment:'right',
		   margin: [20, -20, 10, 20]
	   },
	   p1Name: {
		   fontSize: 9,
		   alignment:'left',
		   margin: [200, -10, 0, 20]
	   },
	   p1Dist: {
		   fontSize: 9,
		   alignment:'right',
		   margin: [10, -10, 200, 20]
	   },
	   tableExample:{
		   margin: [30, 10, 0, 0]
	   },
	   p1Text:{
		   fontSize:10,
		   alignment:'left',
		   margin: [10, -2, 20, 0]
	   },
	   p1PostTable1:{
		   fontSize: 9,
		   alignment:'left',
		   margin: [10, 20, 0, 20]

	   },
	   p1PostTable2: {
		   fontSize: 9,
		   alignment:'right',
		   margin: [10, 20, 150, 20]
	   },
	   bdSign:{
		   fontSize: 9,
		   alignment:'left',
		   margin: [-20, 120, 0, 20]

	   },
	   Sign1Image:{
		   alignment:'left',
		   margin: [40, 90, 0, 20]
	   },
	   Sign2Image:{
		   alignment:'left',
		   margin: [100, 90, 0, 0]
	   },
	   bSign: {
		   fontSize: 9,
		   alignment:'left',
		   margin: [60, 120, 0, 20]
	   },
	   Sign3Image:{
		   alignment:'left',
		   margin: [180, 90, 30, 0]
	   },
	   ofcerSign: {
		   fontSize: 9,
		   alignment:'right',
		   margin: [10, 120, 0, 20]
	   },
	   p2Header:{
		   alignment: 'center',
		   fontSize: 12,
		   bold: true,
		   margin: [-20, 0, 0, 20]

	   },
	   p2SubHeader:{
		   alignment: 'center',
		   fontSize: 12,
		   bold: true,
		   decoration:'underline',
		   margin: [-20, -20, 0, 20]
	   },
	   p2NameKey:{
		   alignment: 'left',
		   fontSize: 10,
		   margin: [10, 0, 0, 5]
	   },
	   p2NameCenter:{
		   alignment: 'center',
		   fontSize: 10,
		   margin: [10, 0, 0, 5]
	   },
	   p2NameValue:{
		   fontSize: 9,
		   alignment:'right',
		   margin: [10, 0, 30, 5]
	   },
	   p2AgeKey:{
		   alignment: 'left',
		   fontSize: 10,
		   margin: [10, 5, 0, 5]
	   },
	   p2AgeCenter:{
		   alignment: 'center',
		   fontSize: 10,
		   margin: [10, 0, 0, 5]
	   },
	   p2AgeValue:{
		   fontSize: 9,
		   alignment:'right',
		   margin: [10, 0, 30, 5]
	   },
	   p2PAdress1Key:{
		   alignment: 'left',
		   fontSize: 10,
		   margin: [10, 5, 0, 5]
	   },
	   p2PAdress1Center:{
		   alignment: 'center',
		   fontSize: 10,
		   margin: [10, 0, 0, 5]
	   },
	   p2PAdress1Value:{
		   fontSize: 9,
		   alignment:'right',
		   margin: [10, 0, 30, 5]
	   },
	   p2PAdress2Key:{
		   alignment: 'left',
		   fontSize: 10,
		   margin:[10, 5, 0, 5]
	   },
	   p2PAdress2Center:{
		   alignment: 'center',
		   fontSize: 10,
		   margin: [10, 0, 0, 5]
	   },
	   p2PAdress2Value:{
		   fontSize: 9,
		   alignment:'right',
		   margin: [10, 0, 30, 5]
	   },
	   p2PRelationKey:{
		   alignment: 'left',
		   fontSize: 10,
		   margin: [10, 5, 0, 5]
	   },
	   p2PRelationCenter:{
		   alignment: 'center',
		   fontSize: 10,
		   margin: [10, 0, 0, 5]
	   },
	   p2PRelationValue:{
		   fontSize: 9,
		   alignment:'right',
		   margin: [10, 0, 30, 5]
	   },
	   p2text1:{
		   fontSize:10,
		   alignment:'left',
		   margin: [10, -2, 20, 0]
	   },
	   p2SubHeader2:{
		   alignment: 'left',
		   fontSize: 10,
		   bold: true,
		   margin: [10, 15, 20, 0]
	   },
	   p2Points:{
		   fontSize:10,
		   alignment:'left',
		   margin: [10, 10, 20, 0]
	   },
	   p2PointFour1:{
		   fontSize:10,
		   alignment:'left',
		   margin: [100, 10, 20, 0]
	   },
	   p2PointFour2:{
		   fontSize:10,
		   alignment:'left',
		   margin: [10, 0, 20, 0]
	   },
	   p2PointFive:{
		   fontSize:10,
		   alignment:'left',
		   margin: [10, 10, 20, 0]
	   },
	   p2Station1:{
		   fontSize:10,
		   alignment:'left',
		   margin: [10, 20, 20, 0]
	   },
	   p2Station2:{
		   fontSize:10,
		   alignment:'right',
		   margin: [10, 20, 20, 0]
	   },
	   p2Date1:{
		   fontSize:10,
		   alignment:'left',
		   margin: [10, 10, 20, 0]
	   },
	   p2Date2:{
		   fontSize:10,
		   alignment:'right',
		   margin: [10, 10, 20, 0]
	   },
   },

}



module.exports ={noticePeriodDoc}