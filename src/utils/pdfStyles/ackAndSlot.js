const Path = require('path');
const {dateFormat} = require('../helper')
let ackAndSlotStyles = {
	watermark: {text: "", color: 'grey', opacity: 0.1, italics: false,fontSize: 20},
	watermark: {text: "", color: 'grey', opacity: 0.2, italics: false,fontSize: 20, margin:[10,0,0,0]},
	content: [
		{
			columns:[
				{
					image:  Path.resolve(__dirname,'','../../../ap_logo.jpg'),
					height: 70,
					width: 70,
					style:'header'
				},
				{
					text:[{text:'Registration & Stamps Department',color:'#27AE60',bold:true,fontSize:17},{text:'\nGovernment of Andhra Pradesh',color:'red'}],style :'title'
				}
				// {text:'Registration & Stamps Department'+'\n'+'Government of Andhra Pradesh',style :'title'},

			],
			
		},
		{
			text:'Special Marriage Registration',style :'title1',color:"blue",bold:true
		},
		{
			columns:[
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star1'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star'
				},
			]
		},
		{	
			columns:[
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star2'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star3'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star3'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star3'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star3'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star3'
				},
				{text:'Acknowledgement Receipt',style:'title2'},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star4'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star5'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star5'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star5'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star5'
				},
				{
					image:  Path.resolve(__dirname,'','../../../star.jpg'),
					height: 12,
					width: 15,
					style:'star5'
				}

			]
			
		},
		{
			style: 'table1',
			table: {
				widths: [100],
				body: [

				]
			}
		},

		{
			
			image:  Path.resolve(__dirname,'','../../../pallakiNote.png'),
			height: 100,
			width: 450,
			style:'pallaki'
			
		},
	],
	styles:{
		header:{
			alignment: 'left',
			margin: [80, 20, 0, 0]
		},
		pallaki:{
			alignment: 'left',
			margin: [30, 0, 0, 0]
		},
		star1:{
			margin:[210,10,0,0]
		},
		star:{
			margin:[210,10,0,0]
		},
		title:{
			alignment: 'center',
			fontSize: 15,
			fontFamily:'segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif;',
			margin: [-20, 40, 0, 0]
		},
		title1:{
			alignment: 'center',
			fontSize: 17,
			fontFamily:'segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif;',
			margin: [10, 40, 0, 0]
		},
		title2:{
			alignment: 'center',
			fontSize: 14,
			fontFamily:'segoe UI, Helvetica Neue, Helvetica, Arial, sans-serif;',

			margin: [25, 20, 0, 0]
		},
		star2:{
			margin: [90, 20, 0, 0]
		},
		star3:{
			margin: [90, 20, 0, 0]
		},
		star4:{
			margin: [-60, 20, 0, 0]
		},
		star5:{
			margin: [-60, 20, 0, 0]
		},
		table1:{
			margin:[30, 10, 30, 0]
		},
		

	}
};
module.exports ={ackAndSlotStyles};