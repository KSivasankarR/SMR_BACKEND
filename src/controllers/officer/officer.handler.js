const service = require('./officer.controller');
const { Handler,reqHandler } = require('../common/requestHandler');

//FORMAT:  exports.<action>=(req,res)=>Handler(req,res,service.<function>,<successMessage>,<failMessage>);
exports.login = (req, res) => Handler(req, res, service.login, 'Success', 'User Details access failed');
exports.signUp = (req, res) => { Handler(req, res, service.signUp, 'Success', 'Save Failed'); }
exports.reset =async (req,res)=> await reqHandler(req,res,service.resetPswrd)
