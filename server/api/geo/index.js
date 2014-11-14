'use strict';

var express = require('express');
var controller = require('./geo.controller');

var router = express.Router();

router.post('/finder', controller.finder);

module.exports = router;
