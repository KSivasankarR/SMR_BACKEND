const service = require('./cast.controller');
const { Handler } = require('../common/requestHandler');

//FORMAT:  exports.<action>=(req,res)=>Handler(req,res,service.<function>,<successMessage>,<failMessage>);
//exports.getCategories = (req, res) => Handler(req, res, service.getCategories, 'Success', 'User Details access failed');
exports.addCast = (req, res) => { Handler(req, res, service.addCast, 'Success', 'Save Failed'); }
exports.castDetails = (req, res) => { Handler(req, res, service.castDetails, 'Success', 'Save Failed'); }
exports.subCastDetails = (req, res) => { Handler(req, res, service.subCastDetails, 'Success', 'Save Failed'); }
