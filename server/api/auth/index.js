'use strict';

var express = require('express');
var controller = require('./auth.controller');

var router = express.Router();

router.post('/token', controller.token);
router.post('/register', controller.register);

module.exports = router;
