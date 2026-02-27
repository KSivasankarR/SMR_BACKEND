const Joi = require("joi");

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require("dotenv").config();
const modes =["development", "production", "test", "provision"];
// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.any().valid(...modes)
    .default("development"),
  SERVER_PORT: Joi.number().default(4040),
  MONGOOSE_DEBUG: Joi.boolean().when("NODE_ENV", {
    is: Joi.string().equal("development"),
    then: Joi.boolean().default(true),
    otherwise: Joi.boolean().default(false),
  }),
  JWT_SECRET_KEY: Joi.string()
    .required()
    .description("JWT Secret required to sign"),
  JWT_SECRET_RESET_KEY: Joi.string()
    .required()
    .description("JWT Reset Secret required"),
    SMR_QR_CODE_LINK: Joi.string()
    .required()
    .description("QR Code required"),
    BASIC_AUTH_CODE: Joi.string()
    .required()
    .description("Auth Code required"),
    EC_API_KEY: Joi.string()
    .required()
    .description("Api Key required"),
    Esign_URL: Joi.string()
    .optional()
    .description("Esign URL"),
    PDF_PATH: Joi.string()
    .optional()
    .description("PDF_PATH required"),
    UPLOAD_PATH: Joi.string()
    .optional()
    .description("UPLOAD_PATH required"),

  mongoDB_URL: Joi.string().required().description("Mongo DB host url"),
//   MONGO_PORT: Joi.number().default(27017),
  MAIL_CONFIG: Joi.string().when("NODE_ENV", {
    is: Joi.string().equal("development"),
    then: Joi.string().default("http://localhost:" + process.env.PORT),
    otherwise: Joi.string().default(
      "http://" + process.env.IP_ADDRESS + `:` + process.env.PORT
    ),
  }),
  EXTERNAL_PORT: Joi.string(),
})
  .unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.SERVER_PORT,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  jwtSecret: envVars.JWT_SECRET_KEY,
  resetJwtSecret: envVars.JWT_SECRET_RESET_KEY,
  SMR_QR_CODE_LINK:envVars.SMR_QR_CODE_LINK,
  mongo: {
    host: envVars.mongoDB_URL
  },
  jwtExpiresIn: envVars.JWT_EXP_IN,
  BASIC_AUTH_CODE:envVars.BASIC_AUTH_CODE,
  EC_API_KEY:envVars.EC_API_KEY,
  Esign_URL:envVars.Esign_URL,
  PDF_PATH :envVars.PDF_PATH,
  UPLOAD_PATH :envVars.UPLOAD_PATH,
};

module.exports = config;
