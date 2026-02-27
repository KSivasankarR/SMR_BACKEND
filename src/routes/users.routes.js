
const fileUpload = require('../common/fileUpload');
const {verifyjwt,roleAuthorization, validateThirdPartyAccess,validateIvrsAccess} = require('../services/auth.service');
const express = require('express');
const userController = require('../controllers/users/users.controller');
const router = express.Router();
const {scheduleJob} =require("node-schedule");
const sysConstanst = require('../utils/sysConstanst');
const Roles = require('../utils/sysConstanst');
const cron = require('node-cron');

router.get('/GetSmrDataForRtgs', validateThirdPartyAccess,userController.GetSmrDataForRtgs);
router.get('/GetSmrStatisticsForRtgs', validateThirdPartyAccess,userController.GetSmrStatisticsForRtgs);
router.post('/verifyEmail',userController.emailVerification);
router.get('/GetRevenueDetailsofSMR',userController.GetRevenueDetailsofSMR)
router.get('/GetMisReportsSMR',userController.GetMisReportsSMR)
router.get('/GetMisReportsByDistrict',[userController.GetMisReportsByDistrict])
router.put('/:otpType/verifyOtp',userController.otpValidate);
router.post('/signup',userController.singup);
router.post('/login',userController.login);
router.put('/saveUser/:id',verifyjwt, roleAuthorization(Roles.Role_User),userController.saveUser);
router.put('/update/:applicationId',verifyjwt,roleAuthorization(Roles.Role_Sro),userController.statusUpdate);
router.put('/fileUpload/:id/:fileName',verifyjwt,roleAuthorization([Roles.Role_User,Roles.Role_Sro]),fileUpload.uploadStore.fields([
    { name: 'image' }]), userController.fileUpload);
router.put('/forgetPassword',userController.forgotPassword);
router.put('/resetPassword',userController.resetPassword);
router.get('/all/:sroCode',verifyjwt,userController.getUsersBySro);
router.get('/:applicationId',verifyjwt,userController.getUserByAppNo);
router.get('/getSroNumber/:district/:sroOffice', verifyjwt, roleAuthorization(Roles.Role_User), userController.getSroNumber);

router.put('/saveDraft/:id', verifyjwt, roleAuthorization(Roles.Role_User), userController.saveDraft);
router.get('/draft/:id', verifyjwt, roleAuthorization(Roles.Role_User), userController.getUserDraft);

//Ivrs api
router.get('/ivrs/GetSmrData', validateIvrsAccess, userController.GetSmrDataForRtgs);
//Ivrs api


// router.put('/schedule',userController.ScheduleJob)


/**
 *We can Expire the users status based on the slot date(slotDate < currentDate) If user is not Presence at Sro on a particular date
 * This job will run everyday at 12AM.
 */
scheduleJob(sysConstanst.Schedule_Time, () => {
    userController.ScheduleJob();
});

//Below one will execute every 21st of December at 11hr 50minuts and 0seconds
// cron.schedule('0 1 16 21 12 *', async () => {
//Below one will execute every 1st of January 0hr 0minuts and 0seconds
cron.schedule('0 40 11 1 1 *', async () => {
    console.log("cron job execution Yearly Inside ");
    let result = await userController.resetSROSequenceNumbers();
    console.log("cron job execution Yearly End ");
});

// Schedule the function to run every sunday at midnight
cron.schedule('0 0 * * 0', async () => {
    console.log('Checking and deleting folders for users...');
    await userController.checkAndDeleteFolderForUsers();
});

module.exports =router;