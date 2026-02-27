var jwt = require('jsonwebtoken');
const config = require('../config/config');
const officerModel = require('../models/officer.model');
const tokenModel = require('../models/tokenModel');
const userModel = require('../models/users.model')
const CryptoJs = require('crypto-js');
const logger = require('../config/winston');
const verifyUser = (req, res) => {
    try {
        return new Promise(function (resolve, reject) {
            const Header = req.headers["authorization"];
            if (typeof Header !== "undefined") {
                try {
                    const verified = jwt.verify(Header, config.jwtSecret);

                    if (verified) {
                        resolve(verified);
                    } else {
                        reject('Invalid User');
                    }
                } catch (error) {
                    reject('Invalid User');
                }
            } else {
                reject('Invalid User');
            }
        })
    } catch (e) {
        logger.error("error ::",e.message);
        res.status(403).send({
            success: false,
            message: e.message,
            data: {}
        });
    }
}

const authUser = (req, res, next) => {
    verifyUser(req, res).then(result => {
        req.userId = result.userId;
        req.userTypeId = result.userTypeId;
        next();
    }).catch(error => {
        res.status(401).send({
            status: false,
            message: error,
            data: {}
        });
    });
}


/*Middleware for verifying the JWT Token. */
const verifyjwt = async function (req, res, next) {
    try {
      let tokenHeader = req.headers['authorization']
      	if (tokenHeader) {
        	let token = await tokenHeader.split(" ");
          	let decoded = jwt.verify(token[1], config.jwtSecret);
			if (decoded) {
				let user;
				req.user = decoded;
				let loginTypeVal = (decoded.loginType)
				if(loginTypeVal =='officer'){
					user = await officerModel.findOne({loginEmail:req.user.loginEmail,loginType:req.user.loginType});
				}else if(loginTypeVal =='USER'){
					user = await userModel.findOne({loginEmail:req.user.loginEmail,loginType:req.user.loginType});
				}
				if(user == undefined || user ==  null){
					return res.status(401).json({ success: false, error: 'Unauthorized Access.' })
				}
				let currentTime = (new Date().getTime())/1000;
				if(decoded.exp < currentTime)
					return res.status(401).json({ success: false, error: 'Token Validity Expired.' });
				else    
					return next();
				// return res.status(200).json({ success:decoded})
			} else {
				return res.status(401).json({ success: false, error: 'Unauthorized Token. User Token required.' });
			}      
      	} else {
			return res.status(401).json({ success: false, error: "Unauthorized Token. User Token required." })
      	}
    } catch (error) {
		console.log("error ::: ", error);
        logger.error("error ::: ", error);
      	return res.status(401).json({ success: false, error: 'JWT Token is expired.' })
    }
}

const authGenerator = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

const createToken =async (user,refreshTokenUrl) => {
	let jwtSecretKey = process.env.JWT_SECRET_KEY;
	const expiresIn =process.env.JWT_EXP_IN;
	const token = jwt.sign(user,jwtSecretKey,{ expiresIn: expiresIn });
	await tokenModel.findOneAndUpdate({userId:user._id,loginType:user.loginType,status:false},{refreshToken:refreshTokenUrl,status:true},{upsert:true});
	return{
        token,
        expires: expiresIn,
		refreshTokenUrl
    };
};
const roleAuthorization = (roles)=>{
	return async (req,res,next)=>{
        const user = req.user;
        let findUser;
		findUser =await userModel.findOne({_id:user._id})
		if(findUser == null){
			findUser = await officerModel.findOne({_id:user._id})
		}
        if(!findUser){
            res.status(422).send({ error: 'No user found.' });
            return next();
        }
        else if(roles.indexOf(findUser.loginType) > -1){
            return next();
        }else{
            return res.status(401).send({statusCode:401, error: `You are not a authorized person` });
            next();
        }
    }
}

const validateThirdPartyAccess = function (req, res, next) {
    try {
        console.log("Inside of validateThirdPartyAccess :::: ");
        const authHeader = req.headers["authorization"];
        const APIKEY = req.headers["api-key"];
        console.log("authHeader :::: ", authHeader);
        logger.info(`authHeader ::::: ${authHeader}`)                                                                                                                                                
        console.log("APIKEY :::: ", APIKEY);
        logger.info(`APIKEY ::::: ${APIKEY}`)                                                                                                                                                
        if (authHeader != undefined && APIKEY != undefined) {
            try {
                let verified;
                let validAuthValue = 'Basic '+process.env.BASIC_AUTH_CODE;
                console.log("validAuthValue :::: ", validAuthValue);
                logger.info(`validAuthValue ::::: ${validAuthValue}`)                                                                                                                                                
                console.log("APIKEY :::: ", process.env.EC_API_KEY);
                logger.info(`APIKEY ::::: ${process.env.EC_API_KEY}`)                                                                                                                                                
 
                if(authHeader == validAuthValue && APIKEY == process.env.EC_API_KEY)
                    verified = true;
 
                if (verified) {
                    req.isMeeSeva = true;
                    console.log("End of validateThirdPartyAccess :::: ");
                    return next();
                } else {
                    console.log("End of validateThirdPartyAccess :::: ");
                    return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
                }
            } catch (error) {
                logger.error("error ::",error);
                console.log("End of validateThirdPartyAccess :::: ");
                return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
            }
        } else {
            console.log("End of validateThirdPartyAccess :::: ");
            return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
        }
    } catch (e) {
        console.log("End of validateThirdPartyAccess :::: ");
        logger.error("error :::",e);
        return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
    }
}

const validateIvrsAccess = function (req, res, next) {
    try {
        console.log("Inside of validateIvrsAccess :::: ");
        const authHeader = req.headers["authorization"];
        const APIKEY = req.headers["api-key"];
        console.log("authHeader :::: ", authHeader);
        console.log("APIKEY :::: ", APIKEY);
        if (authHeader != undefined && APIKEY != undefined) {
            try {
                let verified;
                let validAuthValue = 'Basic '+process.env.BASIC_IVRS_AUTH_CODE;
                console.log("validAuthValue :::: ", validAuthValue);
                console.log("APIKEY :::: ", process.env.IVRS_API_KEY);
 
                if(authHeader == validAuthValue && APIKEY == process.env.IVRS_API_KEY)
                    verified = true;
 
                if (verified) {
                    req.isMeeSeva = true;
                    console.log("End of validateIvrsAccess :::: ");
                    return next();
                } else {
                    console.log("End of validateIvrsAccess :::: ");
                    return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
                }
            } catch (error) {
                console.log("End of validateIvrsAccess :::: ");
                return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
            }
        } else {
            console.log("End of validateIvrsAccess :::: ");
            return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
        }
    } catch (e) {
        console.log("End of validateIvrsAccess :::: ");
        logger.warn(e.message);
        return res.status(401).json({ success: false, error: 'Unauthorized User Access.' });
    }
}

const encryptData = (data) => {
    const parsedkey = CryptoJs.enc.Utf8.parse(process.env.ENC_SECRET_KEY);
    const iv = CryptoJs.enc.Utf8.parse(process.env.ENC_SECRET_IV);
    const encrypted = CryptoJs.AES.encrypt(data, parsedkey, { iv: iv, mode: CryptoJs.mode.ECB, padding: CryptoJs.pad.Pkcs7 });
    return encrypted.toString();
}

const decryptData = (encryptedData) => {
    var keys = CryptoJs.enc.Utf8.parse(process.env.ENC_SECRET_KEY);
    let base64 = CryptoJs.enc.Base64.parse(encryptedData);
    let src = CryptoJs.enc.Base64.stringify(base64);
    var decrypt = CryptoJs.AES.decrypt(src, keys, { mode: CryptoJs.mode.ECB, padding: CryptoJs.pad.Pkcs7 });
    return decrypt.toString(CryptoJs.enc.Utf8);
}


exports.authUser = authUser;
exports.authGenerator = authGenerator;
exports.createToken = createToken;
exports.verifyjwt =verifyjwt;
exports.roleAuthorization=roleAuthorization;
exports.validateThirdPartyAccess=validateThirdPartyAccess;
exports.validateIvrsAccess = validateIvrsAccess;
exports.encryptData= encryptData;
exports.decryptData= decryptData;