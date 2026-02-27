const logger = require('../config/winston');
const userModel = require('./model/admin.model');

exports.getUser = (data) => {
    try {
        return new Promise(function (resolve, reject) {
            userModel.find()
                .then(response => resolve(response))
                .catch(err => reject(err));
        });
    } catch (err) {
        logger.error("process error" + err.message);
        console.log("process error" + err.message);
    }
};

exports.saveUser = (data) => {
    try {
        return new Promise(function (resolve, reject) {
            const users = new userModel(data);
            users.save()
                .then(details => resolve(details))
                .catch(err => reject(err));
        });
    } catch (e) {
        logger.error("process error" + e.message);
        console.log(e.message);
    }
}
