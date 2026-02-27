const Path = require('path');


let int_Mrg_Register ={
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
			text:"CERTIFICATE OF MARRIAGE",style:"header",
		},
		{
			text:"See Section (ii) ",style:'subHeader'
		},
		{
			text:"",style:'subHeader2'
		},
		{
			text:'',style:'content'
		},
		{
			columns:[],style:'brAndGroom'
		},
		{
			columns:[],style:'bride'
		},
		{
			text:'Three Witnesses',style:'witness'
		},
		{
			text:`1.`+'\n'+'\n'+'2.'+'\n'+'\n'+'3.',style:'witness1'
		},
		{
			text:'',style:'footer'
		}

	],
	styles:{
		header:{
			alignment:"center",
			margin:[0,7,0,0],
			fontSize:17,
			bold:true
		},
		subHeader:{
			alignment:"center",
			margin:[0,8,0,0],
			fontSize:10,
			italics:true,
		},
		content:{
			alignment:"justify",
			margin:[30,20,0,0],
			fontSize:15,
		},
		brAndGroom:{
			alignment:"left",
			margin:[300,30,0,0],
			fontSize:15,
		},
		bride:{
			alignment:"left",
			margin:[300,30,0,0],
			fontSize:15,
		},
		Sign3Image:{
			alignment:'right',
			margin: [0, -5, 150, 0]
		},
		Sign2Image:{
			alignment:'right',
			margin: [0, -5, 150, 0]
		},
		witness:{
			alignment:"left",
			margin:[30,20,0,0],
			fontSize:15,
		},
		witness1:{
			alignment:"left",
			margin:[30,20,0,0],
			fontSize:15,
		},
		footer:{
			alignment:"left",
			margin:[180,70,0,0],
			fontSize:15,
		},
	}
};

module.exports = {int_Mrg_Register}