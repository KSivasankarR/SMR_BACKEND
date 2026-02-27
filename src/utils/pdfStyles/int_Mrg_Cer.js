const Path = require('path');


let int_Mrg_Certificate ={
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
			columns:[],
			style:"column1"
		},
		{
			text:'hjjfgf', style:"topHeaderSide"
		},
		{
			text:'dddd',style:"topHeaderSide1"
		},
		{
			image:Path.resolve(__dirname,"",'../../../ap_logo.jpg'),
			width:70,
			hieght:70,
			style:"headerImage"
		},
		{
			text:"CERTIFICATE OF MARRIAGE",style:"header"
		},
		{
			text:"(Sec-13) UNDER SPECIAL MARRIAGE ACT -1954",style:'subHeader'
		},
		{
			text:'',style:'content'
		},
		{
			columns:[],style:'ofcSign'
		},
		{
			text:"",style:"sro"
		},
		{
			columns:[],
			style:"column2"
		},
		{
			columns:[],style:'groomSign'
		},
		{
			columns:[],style:'brideSign'
		},
		{
			text:'Three Witnesses',style:'witness'
		},
		{
			text:`1).`+'\n'+'\n'+'\n'+'2).'+'\n'+'\n'+'\n'+'3).',style:'witness1'
		},
		{
			text:'',style:'footer'
		}

	],
	styles:{
		topHeaderSide:{
			alignment:"right",
			margin:[0,5,10,0],
			fontSize:10,
			color:"grey"
		},
		topHeaderSide1:{
			alignment:"right",
			margin:[0,10,88,0],
			fontSize:10,
			color:"grey"
		},
		headerImage:{
			alignment:"center"
		},
		header:{
			alignment:"center",
			margin:[0,10,0,0],
			color:"#5407b8",
			fillColor:"red",
			fontSize:17,
			bold:true
		},
		Sign3Image:{
			alignment:'left',
			margin: [400, 10, 0, 0]
		},
		ofcerSign: {
			fontSize: 12,
			alignment:'left',
			margin: [318, 40, 0, 0],
		},
		sro:{
			fontSize: 12,
			alignment:'left',
			margin: [318, 0, 0, 0],
		},
		bdSign:{
			fontSize: 12,
			alignment:'left',
			margin: [258, 40, 0, 0],

		},
		Sign1Image:{
			alignment:'left',
			margin: [450, 10, 0, 0]
		},
		Sign2Image:{
			alignment:'left',
			margin: [450, 10, 0, 0]
		},
		bSign: {
			fontSize: 12,
			alignment:'left',
			margin: [258, 40, 0, 0],
		},
		subHeader:{
			alignment:"center",
			margin:[0,8,0,0],
			fontSize:10,
		},
		content:{
			alignment:"justify",
			margin:[30,10,0,0],
			fontSize:15,
		},
		// groomSign:{
		// 	alignment:"left",
		// 	margin:[390,20,0,0],
		// 	fontSize:15,
		// 	italics:true
		// },
		// brideSign:{
		// 	alignment:"left",
		// 	margin:[390,20,0,0],
		// 	fontSize:15,
		// 	italics:true
		// },
		witness:{
			alignment:"left",
			margin:[318,20,0,0],
			fontSize:12,
		},
		witness1:{
			alignment:"left",
			margin:[300,30,0,0],
			fontSize:15,
		},
		footer:{
			alignment:"justify",
			margin:[60,40,0,0],
			fontSize:15,
		},
	}
};

module.exports = {int_Mrg_Certificate}