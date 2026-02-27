const express = require('express');
const app = express();
const env = require('dotenv');
// env.config();
const config = require('./src/config/config')
const bodyParser = require('body-parser');
const path = require("path");
const morgan = require('morgan');
const winston = require('./src/config/winston');
const routes = require('./src/routes/routes');
const swaggerUi = require('swagger-ui-express');
// const cors = require('cors');
swaggerDocument = require('./swagger.json');
// const https =require('https');
require('./src/services/mongoose.service')


// const allowedOrigins = ['http://10.10.120.190:3001', 'http://localhost:3001','https://127.0.0.1:3001', 'https://localhost:3001', 'https://10.10.120.9:4002', 'https://localhost:4002','http://10.10.120.190:3001','https://117.254.87.83:3001','https://10.10.120.190:4001','http://10.10.120.190:4001','http://117.254.87.83:3001/','https://10.10.120.190:3001/', 'http://129.153.106.248/', 'https://129.153.106.248/'];


// app.use(cors({
//     origin: allowedOrigins
// }));
app.use((req, res, next) => {
    // const origin = req.headers.origin;
    // if (allowedOrigins.includes(origin) ) {
    //    res.setHeader('Access-Control-Allow-Origin', origin);
    // }
	res.setHeader('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    } else {
        return next();
    }
});
if (config.env === 'development') {
	app.use(morgan('combined', { stream: winston.stream }));
}


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(express.static(path.join(__dirname, "public/uploads/")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
//app.use('/pdfs', express.static('pdf'))
app.use('/smr/public/uploads', express.static('public/uploads/'))
// app.use('/smr',routes);
app.use(
    '/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
);
// Capture 500 erors
app.use((err,req,res,next) => {
	res.status(500).send(err);
	winston.error(`${err.status || 500} - ${res.statusMessage} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,);
})
	
// Capture 404 erors
app.use((err,req,res,next) => {
	res.status(404).send(err);
	winston.info(`400 || ${res.statusMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
})

app.use('/smr',routes)
const fs = require('fs');
// const server = https.createServer({
// 	key:fs.readFileSync('./cert/localhost+2-key.pem'),
// 	cert:fs.readFileSync('./cert/localhost+2.pem'),
// 	requestCert:false,
// 	rejectUnauthorized:false,
// },app).listen(process.env.PORT,()=>{
	
// 	console.log('Server is listening at ' + process.env.IP_ADDRESS +':%s', process.env.PORT); 
// })
app.listen(process.env.PORT, () => { 
    console.log('Server is listening at ' + process.env.IP_ADDRESS +':%s', process.env.PORT); 
});
