const express = require('express');
const router = express.Router();
const {verifyPaymentStatus, defaceTransID} = require('../controllers/payment/paymentController');
const { verifyjwt, roleAuthorization } = require('../services/auth.service');
const Roles = require('../utils/sysConstanst');


router.get('/:appId/:flag', verifyjwt, verifyPaymentStatus);
router.post('/deface/:id', verifyjwt, roleAuthorization(Roles.Role_Sro), defaceTransID); 

module.exports = router;