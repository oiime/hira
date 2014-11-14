'use strict';

var express = require('express');
var controller = require('./slocation.controller');

var router = express.Router();


router.post('/finder', controller.finder);
router.post('/', controller.save);
router.post('/:id', controller.save);
router.get('/:id', controller.get);
router.delete('/:id', controller.delete);

module.exports = router;
