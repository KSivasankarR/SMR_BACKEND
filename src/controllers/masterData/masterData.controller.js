const logger = require('../../config/winston');
const userModel = require('../../models/masterData.model');
const jwt = require('../../services/auth.service');
const fs = require("fs");
const path = require("path");

/**
   * @api : /masterdata,
   * @apiType : POST,
   * @apiDesc : Creating MasterData
   * @apiResponse : 200,Success Response
*/
exports.masterData = (req) => {
    try {
        let filepath = path.join(__dirname, "./state_data.json");
        const jsonString = fs.readFileSync(filepath);
        const customer = JSON.parse(jsonString);
        return new Promise((resolve, reject) => {
            userModel.create(customer)
                .then(response => {
                    resolve("Data added");
                }).catch(err => reject(err));
        });
    } catch (err) {
        logger.error("process error" + err.message);
        console.log("process error" + err.message);
    }
};
/**
   * @api : /categories,
   * @apiType : GET,
   * @apiDesc : Get Categories
   * @apiResponse : 200,Success Response
*/
exports.getCategories = async (req, res) => {
    try {
        let conditionObj = {};
        let requiredKeysObj = { _id: 0 };
        let reqKey;
        const reqQuery = req.query;
        if (reqQuery.state && reqQuery.district && reqQuery.mandal) {
            conditionObj = {
                districtName: reqQuery.district,
                mandalName: reqQuery.mandal,
            }
            requiredKeysObj.sroName = 1;
            reqKey = "sroName"
        } else if (reqQuery.state && reqQuery.district) {
            conditionObj = {
                districtName: reqQuery.district
            }
            requiredKeysObj.mandalName = 1;
            reqKey = "mandalName"
        } else {
            requiredKeysObj.districtName = 1;
            reqKey = "districtName"
        }
        const data = await userModel.aggregate([
            { "$match": conditionObj },
            { "$group": { _id: { value: `$${reqKey}` } } },
            { "$project": { _id: 0, value: "$_id.value" } },
            { "$sort": { value: 1 } }
        ])
        logger.info(`data ::::: ${JSON.stringify(data)}`)                                                                                                                  
        if (reqKey === "sroName") {
            vsws = await userModel.aggregate([
                { "$match": { ...conditionObj, villageScretariatCode: { $exists: true }, villageScretariatName: { $exists: true } } },
                { "$group": { _id: { villageScretariatCode: "$villageScretariatCode", villageScretariatName: "$villageScretariatName", sroName: "$sroName", parentSroCode: "$parentSroCode" } } },
                { "$project": { _id: 0, villageScretariatCode: "$_id.villageScretariatCode", villageScretariatName: "$_id.villageScretariatName", sroOffice: "$_id.sroName", sroCode: "$_id.parentSroCode" } },
                { "$sort": { villageScretariatName: 1 } }]);
            logger.info(`vsws ::::: ${JSON.stringify(vsws)}`)                                                                                                                                             
            return res.status(200).send({ Success: true, data: { sros: data.map(g => g.value), vsws } })
        }
        return res.status(200).send({ Success: true, data: data.map(g => g.value) });
    } catch (ex) {
        logger.error("ERROR ::",ex.message);
        console.log("ERROR ::", ex.message);
        res.status(500).send({ Success: false, message: 'Internal Server Problem' })
    }
};
