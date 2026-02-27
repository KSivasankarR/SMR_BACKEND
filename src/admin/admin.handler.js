const service = require('./admin.controller');
const { Handler } = require('../common/requestHandler');

//FORMAT:  exports.<action>=(req,res)=>Handler(req,res,service.<function>,<successMessage>,<failMessage>);
exports.getUser = (req, res) => Handler(req, res, service.getUser, 'Success', 'User Details access failed');
exports.saveUser = (req, res) => { Handler(req.body, res, service.saveUser, 'Success', 'Save Failed'); }
