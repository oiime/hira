'use strict';

var express = require('express');
var controller = require('./tag.controller');
var helpers = require('../helpers');
var c = require('../../const');

var router = express.Router();

router.post('/finder', controller.finder);
router.post('/',helpers.validateRole(c.ROLE_ADMIN), controller.save);
router.post('/:id', helpers.validateRole(c.ROLE_ADMIN), controller.save);
router.delete('/:id', helpers.validateRole(c.ROLE_ADMIN), controller.delete);

module.exports = router;
