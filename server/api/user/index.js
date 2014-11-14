'use strict';

var express = require('express');
var controller = require('./user.controller');
var helpers = require('../helpers');
var c = require('../../const');

var router = express.Router();


router.post('/finder', helpers.validateRole(c.ROLE_ADMIN), controller.finder);
router.get('/:id', helpers.validateRole(c.ROLE_ADMIN), controller.get);
router.post('/:id/status', helpers.validateRole(c.ROLE_ADMIN), controller.changeStatus);
router.delete('/:id', helpers.validateRole(c.ROLE_ADMIN), controller.delete);

module.exports = router;
