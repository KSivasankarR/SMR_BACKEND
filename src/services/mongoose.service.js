/* global mongodb;
 * FileName @mongoose.service
 * author @Criticl River
 * <summary>
 *  A service is used to connect database, check connection if failed to connect it will retry to connect again.
 *  <npm>
 *      @log4js {Used for logging debug,information and errors in mongoose module}
 *      @mongoose {Mongoose is a MongoDB object modeling tool designed to work in an asynchronous environment. Mongoose supports both promises and callbacks}
 *  </npm>
 * </summary>
 */

const mongoose = require('mongoose');
const env = require('dotenv');
const logger = require('../config/winston');
env.config();

const uri = "mongodb+srv://hmr_cruser:hmr_cruser%40123@hmrcluster.gz42my3.mongodb.net/HMR?retryWrites=true&w=majority";
let count = 0;

const options = {
    maxPoolSize: 300,
	maxIdleTimeMS:500,  //0.5 Seconds
	socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    useNewUrlParser: true
};
mongoose.set('strictQuery', true);
const connectWithRetry = () => {
    console.log('MongoDB connection with retry')
    mongoose.connect(process.env.mongoDB_URL, options).then(() => {
        console.log('MongoDB is connected');
		console.log("MongoDb Connections",mongoose.connections.length)
        logger.info(`MongoDb Connections ::::: ${mongoose.connections.length}`)                                                                                                                                                
    }).catch(err => {
        console.log(err);
        logger.error("error ::",err);
        console.log('MongoDB connection unsuccessful, retry after 5 seconds. ', ++count,mongoose.connections.length);
        // setTimeout(connectWithRetry, 5000)
    })
};

connectWithRetry();

