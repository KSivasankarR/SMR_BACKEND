
const mrCer = require('../controllers/mrgCertificate/mrgCertificate.controller');
const express = require('express');
const router = express.Router();
const {verifyjwt, roleAuthorization} = require('../services/auth.service');
const { Role_Sro } = require('../utils/sysConstanst');
router.put('/:type/:applicationId?',verifyjwt,mrCer.splMrgPdf);
router.get('/downloadDocument/:docType/:appNo/:type',verifyjwt, mrCer.downloadDocument);
router.get('/downloadDocumentview/:docType/:appNo/:type',mrCer.downloadDocument);
router.get('/EsignCoordinates',verifyjwt,mrCer.EsignCoordinates);
router.get('/pendingEsign',verifyjwt,mrCer.pendingEsign);
// router.get('/ack/:type/:applicationId',mrCer.ackAndSlot)
// router.get('/sms',mrCer.sms)


module.exports = router;

