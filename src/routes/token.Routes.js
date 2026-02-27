const express = require('express');
const userController = require('../controllers/users/users.controller');
const router = express.Router();



router.get('/',userController.refreshToken);
module.exports= router;