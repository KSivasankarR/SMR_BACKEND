
const jwt = require('../services/auth.service');
const casteController = require('../controllers/cast/cast.controller');
const express = require('express');
const {verifyjwt} = require('../services/auth.service')
const router = express.Router()


router.post('/',casteController.addCast);
 router.get('/castDetails', casteController.castDetails);
router.get('/subCastDetails', casteController.subCastDetails);

module.exports = router;