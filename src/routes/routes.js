const users = require('./users.routes');
const master = require('./masterData.routes');
const caste = require('./cast.routes');
const officer = require('./officer.routes')
const token = require('./token.Routes')
const mc = require('./mrCer.routs');
const payment = require('./payment.routes');
const express = require('express');
const {verifyjwt,roleAuthorization} = require('../services/auth.service');
const Roles = require('../utils/sysConstanst')


const router = express.Router();
router.get("/health-check",verifyjwt, (req, res) => {res.send("OK")});
router.use('/users',users);
router.use('/caste',caste);
router.use('/',master);
router.use('/officer',officer);
router.use('/token',token);
router.use('/mc',mc);
router.use('/payment', payment);



module.exports = router;