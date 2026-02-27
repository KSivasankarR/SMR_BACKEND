const Path = require('path');
const {dateFormat} = require('../helper')
let dataPrintStyles = {
	watermark: {text: "", color: 'grey', opacity: 0.1, italics: false,fontSize: 20},
	watermark: {text: "", color: 'grey', opacity: 0.2, italics: false,fontSize: 20, margin:[10,0,0,0]},
	content: [
		{
			columns:[
				{
					image:  Path.resolve(__dirname,'','../../../ap_logo.jpg'),
					height: 100,
					width: 100,
					style:'header'
				},
				{
					text:[{text:'Registration & Stamps Department',color:'#0ca2a7'},{text:'\nGovernment of Andhra Pradesh',color:'#e08918'}],style :'title'
				}
				// {text:'Registration & Stamps Department'+'\n'+'Government of Andhra Pradesh',style :'title'},

			],
			
		},
		{
			text:'SPECIAL MARRIAGE REGISTRATION',style :'title1'
		},
		{
			columns:[
				{
					text:[],style :'appNo'
				},
				{
					text:[],style :'date'
				}
			]
		},
		{
			style: 'table1',
			table: {
				widths: [100,200 ,'auto', 'auto'],
				headerRows: 2,
				body:[
					[{text: '', style: 'tableHeader',  alignment: 'center'},{text:"headerffff",colSpan:2}, {}, {text: 'Header 3', style: 'tableHeader', alignment: 'center'}],
				]
			}
		},
	],
	styles:{
		header:{
			alignment: 'left',
			margin: [15, 20, 0, 0]
		},
		
		title:{
			alignment: 'center',
			fontSize: 23,
			fontFamily:'segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif;',
			margin: [-30, 40, 0, 0]
		},
		appNo:{
			alignment: 'left',
			fontSize: 12,
			margin: [15, 10, 0, 0]
		},
		title1:{
			alignment: 'center',
			fontSize: 18,
			fontFamily:'segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif;',
			margin: [10, 2, 0, 0]
		},
		title2:{
			alignment: 'center',
			fontSize: 12,
			fontFamily:'segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif;',

			margin: [25, 20, 0, 0]
		},

		date:{
			alignment:"right",
			margin:[0, 10, 30, 0]
		},
		table1:{
			margin:[15, 10, 30, 0]
		},
		

	}
};
module.exports ={dataPrintStyles};