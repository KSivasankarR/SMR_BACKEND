
const {verifyjwt} = require('../services/auth.service')
const express = require('express');
const masterController = require('../controllers/masterData/masterData.controller')
const router = express.Router();

router.get('/categories',masterController.getCategories);
router.post('/masterdata',masterController.masterData)

module.exports = router;