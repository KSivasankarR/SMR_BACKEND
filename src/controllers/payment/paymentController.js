const logger = require("../../config/winston");
const payment = require("../../models/paymentReceipt.model");
const { returnResponseObj } = require("../../utils/genericFunctions");
const axios = require('axios');
const https = require('https');

const instance = axios.create({
    httpsAgent: new https.Agent({  
      rejectUnauthorized: false
    })
  });

const verifyPaymentStatus = async (req, res) => {
    try {
        const paymentDetails = await getPaymentDataByAppId(req.params.appId, req.params.flag);
        logger.info(`paymentDetails ::::: ${paymentDetails}`)                                                                                                                                                
        if(paymentDetails.length === 1){
            res.status(200).send(paymentDetails[0]);
        } else {
            res.status(404).send({message: "Payment details not found for this application number", status: false})
        }
    } catch (err) {
        console.log(err);
        logger.error(" error ::: ", err);
        res.status(500).json({...returnResponseObj(500)});
    }
}

const getPaymentDataByAppId = async(appId, flag = 0) => {
    const query = flag ? {applicationNumber: appId, transactionStatus: "Success"} : {applicationNumber: appId, isUtilized: false};
    const data = await payment.find(query).sort({createdAt: -1}).limit(1);
    return data;
}

const defaceTransID = async(req, res) => {
    try {
    const body = {
        deptTransactionID: btoa(req.params.id)
      };
    const resp = await instance.post(process.env.THIRD_PARTY_PAYMENT_URL, body);
    logger.info(`response ::::: ${resp}`)                                                                                                                                                
    if(resp && resp.data && resp.data.statusCode === 200 ){
        await payment.findOneAndUpdate({departmentTransID: req.params.id}, {$set: {isUtilized: true}});
        res.status(200).send({message: "Defaced transaction ID successfully"});
    } else {
        res.status(400).send({message: resp.data && resp.data.message ? resp.data.message : "Defacement of transaction ID failed"})
    }
    } catch (err) {
        console.log(err);
        logger.error(" error ::: ", err);
        res.status(500).send({...returnResponseObj(500)});
    }
}

module.exports = {verifyPaymentStatus, getPaymentDataByAppId, defaceTransID};