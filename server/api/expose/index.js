'use strict';

var express = require('express');
var controller = require('./expose.controller');

var router = express.Router();

router.get('/sql/data', controller.sqldumpData);
router.get('/sql/structure', controller.sqldumpStructure);
router.get('/json/entries', controller.jsonEntries);
router.get('/csv/entries', controller.csvEntries);
module.exports = router;
