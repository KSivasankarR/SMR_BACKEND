let intendedDeclaration = {
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
	content: [
		{
			text:"FORM-II",
			style:"topHeader",
			pageOrientation: 'portrait',
		},
		{
			text: `DECLARATION TO BE MADE BY THE BRIDEGROOM`,
			 style:'p1Header',
			
			
		},
		{ text: `THE THIRD SCHEDULE`+'\n'+`(SEE SECTION - II)`, style:`p1sideHeaders`},
		{
			text:''
			,style:'p1Text'
		},
		{
			text:
			'1.       I am at the present time unmarried/widower/diverse as the case may be.         ',
			style:"p1Points"
		},
		{text:'',style:'groomAge'},
		{text:'',style:'groomRelated'},
		{
			text:
			'prohibited relationship.'+'\n',
			style:"p1Points1",margin:[35,0,0,0]
		},
		{
			text:
			'4.       I am aware that If any statement in this declaration is false and if in making such a statement I either ',
			style:"p1Points2"
		},
		{
			text:
			'know or believe it to be false or do not believe it to be true.'+'\n'+'\n'+'I am liable to imprisonment and also to be fine.',
			style:"p1Points1"
		},
		{
			text:
			'BRIDEGROOM',
			style:"sign"
		},

		{
			text: `DECLARATION TO BE MADE BY THE BRIDE`,
			style:'p1Header',
			
		},
		{
			text:'',style:'p1bride'
		},
		{
			text:
			'1.       I am at the present time unmarried/widower/diverse as the case may be.         ',
			style:"p1Points"
		},
		{text:'',style:'brideAge'},
		{text:'',style:'brideRelated'},
		{
			text:
			'prohibited relationship.'+'\n',
			style:"p1Points1",margin:[35,0,0,0]
		},
		{
			text:
			'4.       I am aware that If any statement in this declaration is false and if in making such a statement I either ',
			style:"p1Points2"
		},
		{
			text:
			'know or believe it to be false or do not believe it to be true.'+'\n'+'\n'+'I am liable to imprisonment and also to be fine.',
			style:"p1Points1"
		},
		{
			text:
			'BRIDE      ',
			style:"signBride"
		},
		{
			text:
			'Signed in our presence by the above named.',
			style:"p1Points"
		},
		{
			columns:[
				{
					text:
					'',
					style:"p1PointsStart"
				},
				{
					text:'and',
					style:"p1PointsCenter"
				}
			]

		},
		{
			columns:[
				{
					text:
					'',
					style:"p1PointsStart"
				},
				{
					text:'so far as we aware there is no lawful impediment to the marriage.',
					style:"p2Pointsright"
				}
			]

		},
		{
			text:'WITNESSES',
			style:"witness"
		},
		{
			columns:[
				{
					text:
					'1.',
					style:"witness1"
				},
				{
					text:'COUNTER SIGNED',
					style:"signed"
				}
			]

		},
		{
			columns:[
				{
					text:
					'2.',
					style:"witness1"
				},
				{
					text:'',
					style:"signed"
				}
			]
		},
		{
			columns:[
				{
					text:
					'3.',
					style:"witness1"
				},
				{
					text:'Dated the               20',
					style:"signed"
				}
			]
		},
		{
			text:'MARRIAGE OFFICER',
			style:"ofcrSign",
			margin: [0, 0, 2, 0]
		},
	],
	
	styles: {
		topHeader:{
			alignment:'right',
			fontSize:6,
			bold:true
		},
		p1Header: {
			
			alignment: 'center',
			fontSize: 12,
			fontFamily:'segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif;',
    		bold: true,
			decoration:'underline',
			margin: [-20, 10, 0, 20]
		},
		p1sideHeaders: {
			
			alignment: 'center',
			fontSize: 10,
			margin: [-20, -20, 0, 20]
			
		},
		p1Text:{
			fontSize:10,
			alignment:'left',
			margin: [50, -2, 20, 0]
		},
		p1bride:{
			fontSize:10,
			alignment:'left',
			margin: [50, -2, 20, 0]
		},

		p1Points:{
			fontSize:10,
			alignment:'left',
			margin: [10, 10, 20, 0]
		},
		groomAge:{
			fontSize:10,
			alignment:'left',
			margin: [10, 10, 20, 0]
		},
		groomRelated:{
			fontSize:10,
			alignment:'left',
			margin: [10, 10, 20, 0]
		},
		brideAge:{
			fontSize:10,
			alignment:'left',
			margin: [10, 10, 20, 0]
		},
		brideRelated:{
			fontSize:10,
			alignment:'left',
			margin: [10, 10, 20, 0]
		},
		p1Points1:{
			fontSize:10,
			alignment:'left',
			margin: [32, 0, 20, 0]
		},
		p1Points2:{
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
		sign:{
			fontSize:10,
			bold:true,
			alignment:'right',
			margin: [10, 30, 40, 0]
		},
		signBride:{
			fontSize:10,
			bold:true,
			alignment:'right',
			margin: [10, 30, 70, 0]
		},
		p1PointsStart:{
			fontSize:10,
			alignment:'left',
			margin: [10, 10, 20, 0]
		},
		p1PointsCenter:{
			fontSize:10,
			alignment:'center',
			margin: [0, 20, 180, 0]
		},
		p2Pointsright:{
			fontSize:10,
			alignment:'left',
			margin: [-40, 10, 0, 0]
		},
		witness:{
			alignment: 'left',
			fontSize: 10,
			fontFamily:'segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif;',
    		bold: true,
			decoration:'underline',
			margin: [10, 5, 0, 20]
		},
		witness1:{
			alignment: 'left',
			fontSize: 10,
			margin: [10, 5, 0, 2]
		},
		signed:{
			alignment: 'right',
			fontSize: 10,
			margin: [0, 5, 30, 2]
		},
		ofcrSign:{
			alignment: 'right',
			fontSize: 10,
			margin: [0, 5, 25, 2]
		}
	}

}



module.exports ={intendedDeclaration}