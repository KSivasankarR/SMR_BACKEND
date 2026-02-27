const { right } = require('cli-color/move');
const Path = require('path');


let after_Mrg_Certificate ={
	background:  ()=> {
		return [
			{
				canvas: [
					{type: 'rect',x: 20,y: 20,w: 800,h: 550,r: 4,lineColor: 'black'},
					{type: 'rect',x: 22,y: 22,w: 795,h: 545,r: 2,lineColor: 'grey'}
				],

			}
		]
	},
	pageOrientation: 'landscape',
	content:[
		{
			columns:[],
			style:"column1"
		},
		{
			columns:[
				{
					text:'',style:{alignment:"left"}
				},
				{
					image:Path.resolve(__dirname,"",'../../../ap_logo.jpg'),
					width:60,
					hieght:60,
					style:"headerImage"
				},
				{
					text:'', style:"topHeaderSide"
				}
			]
		},
		{
			text:"CERTIFICATE OF MARRIAGE",style:"header"
		},
		{
			text:"CELEBRATED IN OTHER FORMS (SEC-16  UNDER SPECIAL MARRIAGE ACT - 1954)",style:'subHeader'
		},
		{
			text:'',style:'content'
		},
		{
			text:'',style:'content2'
		},
		// {
		// 	text:'',style:'brAndGroom'
		// },
		{	
			columns:[
				{text:'THREE WITNESSES:',style:'witness'},{text:"",style:{alignment:'center'}},{text:'MARRIAGE OFFICER',style:'mrgOfcr'},
			]
			
		},
		{	
			columns:[],style:"signcolumns"
			
		},
		// {
		// 	text:`1.`+'\n'+'\n'+'2.'+'\n'+'\n'+'3.',style:'witness1'
		// },
		{
			text:'',style:'footer'
		},
		{
			text:'No of Corrections:',style:'footer1'
		}

	],
	styles:{
		topHeader:{
			alignment:"center",
			fontSize:10,
		},
		topHeaderSide:{
			alignment:"right",
			margin:[0,0,10,0],
			fontSize:10,
			color:"grey"
		},
		topHeaderSide1:{
			alignment:"right",
			margin:[0,0,88,0],
			fontSize:10,
			color:"grey"
		},
		topHeader1:{
			alignment:"center",
			margin:[0,7,0,0],
			fontSize:10
		},
		topHeader2:{
			alignment:"center",
			margin:[0,7,0,0],
			fontSize:10
		},

		header:{
			alignment:"center",
			margin:[0,5,0,0],
			decoration:"underline",
			fontSize:13,
			bold:true
		},
		headerImage:{
			alignment:"center"
		},
		subHeader:{
			alignment:"center",
			margin:[0,8,0,0],
			fontSize:10,
		},
		sideHeader1:{
			alignment:"right",
			margin:[0,8,0,0],
			fontSize:10,
		},
		sideHeader1:{
			alignment:"right",
			margin:[0,8,0,0],
			fontSize:10,
		},
		content:{
			alignment:"justify",
			margin:[10,10,0,0],
			fontSize:14,
		},
		content2:{
			alignment:"justify",
			margin:[10,5,0,0],
			fontSize:14,
		},


		brAndGroom:{
			alignment:"left",
			margin:[30,30,0,0],
			fontSize:15,
			
		},
		witness:{
			alignment:"left",
			margin:[10,50,0,0],
			fontSize:12,
			bold:true,
			decoration:"underline"
		},
		mrgOfcr:{
			alignment:"right",
			margin:[0,50,70,0],
			fontSize:12,
		},
		mrgOfcr2:{
			alignment:"right",
			margin:[0,50,70,0],
			fontSize:12,
		},
		witnesses:{
			alignment:"left",
			margin:[10,20,0,0],
			fontSize:12,
		},
		sign:{
			alignment:"justify",
			margin:[70,20,0,0],
			fontSize:12,
		},
		footer:{
			alignment:"center",
			margin:[-60,30,0,0],
			fontSize:12,
		},
		footer1:{
			alignment:"left",
			margin:[10,0,0,0],
			fontSize:10,
			bold:true
		}
	}
};

module.exports = {after_Mrg_Certificate}