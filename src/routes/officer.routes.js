
const fileUpload = require('../common/fileUpload');
const {verifyjwt,roleAuthorization} = require('../services/auth.service');
const express = require('express');
const officer = require('../controllers/officer/officer.controller');
const router = express.Router();
const users = require('../controllers/users/users.controller');
const Roles = require('../utils/sysConstanst');

// exports.routesConfig = (app) => {
//     app.post('/api/officer/signup', [handler.signUp]);
//     app.post('/api/officer/login', [handler.login]);
// 	app.put('/api/officer/resetPassword',[handler.reset])
// }

router.post('/signup',officer.signUp);
router.post('/login',officer.login);
router.put('/notice/:applicationId',verifyjwt,roleAuthorization(Roles.Role_Sro),officer.updateNoticeByAppID);
router.get('/allUsers',officer.usersgetByDist);
router.put('/update/sro/:type',verifyjwt,roleAuthorization(Roles.Role_Sro),verifyjwt,officer.update);
router.get('/getSRO',verifyjwt,roleAuthorization(Roles.Role_Sro),officer.getSroDetails);
router.post('/saveUser',verifyjwt,roleAuthorization(Roles.Role_Sro),officer.saveUserbyOfficer);
router.put('/fileUploads/:id',verifyjwt,roleAuthorization(Roles.Role_Sro),fileUpload.uploadStore.any(), officer.sroDataEntryDocsUpload);
router.get('/sro/users', officer.getUsersBySRO);
router.get('/officerStatistics',verifyjwt,roleAuthorization(Roles.Role_Sro), officer.officerStatistics);
router.get('/officerStatisticDetails',verifyjwt,roleAuthorization(Roles.Role_Sro), officer.officerStatisticDetails);
router.post('/officerStatisticsdistrictdata',verifyjwt,roleAuthorization(Roles.Role_Sro) ,officer.officerStatisticsdistrictdata);
router.post('/officerStatisticsMandaldata',verifyjwt,roleAuthorization(Roles.Role_Sro) ,officer.officerStatisticsMandaldata);
router.post('/officerStatisticsvillagedata',verifyjwt,roleAuthorization(Roles.Role_Sro) ,officer.officerStatisticsvillagedata);
router.post('/getRegistrationsByStatisticValues',verifyjwt,roleAuthorization(Roles.Role_Sro) ,officer.getRegistrationsByStatisticValues,)
module.exports = router;