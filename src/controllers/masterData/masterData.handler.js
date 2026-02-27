const service = require('./masterData.controller');
const { Handler } = require('../common/requestHandler');

//FORMAT:  exports.<action>=(req,res)=>Handler(req,res,service.<function>,<successMessage>,<failMessage>);
exports.getCategories = (req, res) => Handler(req, res, service.getCategories, 'Success', 'User Details access failed');
exports.masterData = (req, res) => { Handler(req, res, service.masterData, 'Success', 'Save Failed'); }
