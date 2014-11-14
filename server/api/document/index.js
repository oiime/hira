'use strict';

var express = require('express');
var controller = require('./document.controller');

var router = express.Router();

router.post('/', controller.post);
router.delete('/:id', controller.delete);

module.exports = router;
