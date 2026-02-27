const Path =require('path');
 let after_Mrg_Declaration = {
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
	content:[
		{
			text: 'FORM - || (Rule 7 (1)',
			style:'p2Header',
			
		},
		{
			text: 'APPLICATION FOR REGISTRATION OF A MARRIAGE UNDER SECTION 16 OF THE'+'\n'+'SPECIAL MARRIAGE ACT, 1954(CENTRAL ACT,XLIII/1954)',
			style:'p2SubHeader'
			
		},
		{
			columns:[
				{
					text: '1. Name of Parties',
					style:'p2NameKey'
				},
				{
					text: ':',
					style:'p2NameCenter'
				},
				{
					text: '                       (Husband)',
					style:'p2NameValue'
				}
			]

			
		},
		{	
			columns:[
				{
					text: '2. Age of Parties',
					style:'p2AgeKey'
				},
				{
					text: ':',
					style:'p2AgeCenter'
				},
				{
					text: '                       (Husband)'+'\n'+'\n'+'                       (Wife)',
					style:'p2AgeValue'
				}

			]
		},
		{
			columns:[
				{
					text: '3. Permanent Dwelling place, If any',
					style:'p2PAdress1Key'
				},
				{
					text: ':',
					style:'p2PAdress1Center'
				},
				{
					text: '',
					style:'p2PAdress1Value'
				}

			]

			
		},
		{
			columns:[
				{
					text: '4. Present Dwelling place, If any',
					style:'p2PAdress2Key'
				},
				{
					text: ':',
					style:'p2PAdress2Center'
				},
				{
					text: '',
					style:'p2PAdress2Value'
				}

			]

			
		},
		{
			columns:[
				{
					text: '5. Relationship, If any of Parties before marriage.',
					style:'p2PRelationKey'
				},
				{
					text: ':',
					style:'p2PRelationCenter'
				},
				{
					text: '',
					style:'p2PRelationValue'
				}

			]
			
		},
		{
			
			text: '',
			style:'p2text1'
		},
		{
			text:'WE HEREBY DECLARE THAT :',style:"p2SubHeader2"
		},
		{
			text:
			'i)       Neither of us has more than one spouse living on the date mentioned in this application;'+'\n'+'\n'+
			'ii)      Neither of us in an idiot or lunetic;'+'\n'+'\n'+
			'iii)     Both of us have complete the age of twenty one years on the date of this application;'+'\n'+'\n'+
			'iv)      We are not within the degrees of prohibited relationship.',
			style:"p2Points"
		},
		{
			text:
			'          Our Marriage was celebrated before the commencement of Special Marriage Act, 1954',
			style:"p2PointFour1"
		},
		{
			text:
			'(Central Act XLIII of 1954) and according to the law, custom or usage having the force of law,govering of us,'+'\n'+
			'marriage  between us is  permitted through we are with in the degree of  prohibited each  relationship'+'\n'+
			'according to the Act aforesaid.'+'\n'+'\n'+
			'Note:  Score out whichever is not appicable.',
			style:"p2PointFour2"
		},
		{text:'',style:'sro'},
		{
			text:
			'         for a period of not less than thirty days immediately proceeding the date of the application.'+'\n'+
			'         We also declare that all the above particulars are true to the best of my knowledge and belief.',
			style:"p2PointFive"
		},

		{
			columns:[
				{
					text:
					'Station :',
					style:"p2Station1"
				},
				{
					text:'(Husband)    Signature:',
					style:"p2Station2"
				}
			]

		},
		{
			columns:[
				{
					text:
					'Date :',
					style:"p2Date1"
				},
				{
					text:'(Wife)    Signature:',
					style:"p2Date2"
				}
			]

		}
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
			margin: [200, 20, 0, 20]
		},
		p1Dist: {
			fontSize: 9,
			alignment:'right',
			margin: [10, 20, 200, 20]
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
			margin: [10, 100, 0, 20]

		},
		bSign: {
			fontSize: 9,
			alignment:'center',
			margin: [10, 100, 0, 20]
		},
		ofcerSign: {
			fontSize: 9,
			alignment:'right',
			margin: [10, 100, 30, 20]
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
			alignment: 'left',
			fontSize: 10,
			margin: [50, 0, 0, 5]
		},
		p2NameValue:{
			fontSize: 9,
			alignment:'left',
			margin: [-30, 0, 30, 5]
		},
		p2AgeKey:{
			alignment: 'left',
			fontSize: 10,
			margin: [10, 5, 0, 5]
		},
		p2AgeCenter:{
			alignment: 'left',
			fontSize: 10,
			margin: [50, 0, 0, 5]
		},
		p2AgeValue:{
			fontSize: 9,
			alignment:'left',
			margin: [-30, 0, 30, 5]
		},
		p2PAdress1Key:{
			alignment: 'left',
			fontSize: 10,
			margin: [10, 5, 0, 5]
		},
		p2PAdress1Center:{
			alignment: 'left',
			fontSize: 10,
			margin: [50, 0, 0, 5]
		},
		p2PAdress1Value:{
			fontSize: 9,
			alignment:'left',
			margin:  [-30, 0, 30, 5]
		},
		p2PAdress2Key:{
			alignment: 'left',
			fontSize: 10,
			margin:[10, 5, 0, 5]
		},
		p2PAdress2Center:{
			alignment: 'left',
			fontSize: 10,
			margin: [50, 0, 0, 5]
		},
		p2PAdress2Value:{
			fontSize: 9,
			alignment:'left',
			margin: [-30, 0, 30, 5]
		},
		p2PRelationKey:{
			alignment: 'left',
			fontSize: 10,
			margin: [10, 5, 0, 5]
		},
		p2PRelationCenter:{
			alignment: 'left',
			fontSize: 10,
			margin: [50, 0, 0, 5]
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
			margin: [20, 1, 20, 0]
		},
		sro:{
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
};
module.exports ={after_Mrg_Declaration};