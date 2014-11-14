'use strict';

var _ = require('lodash');
var jwt = require('jsonwebtoken');
var config = require('../../config/environment');
var helpers = require('../helpers');

var registerSchema = {
  "type": "object",
  "properties": {
    "name": {"type": "string", "minimum": 1, "required": true},
    "email": {"type": "email", "required": true},
    "password": {"type": "string", "required": true},
    "org": {"type": "string"}
  }
};
exports.register = function(req, res) {
  helpers.validateAgainst(req.body, registerSchema, function(err, user){
    if(err){
      res.status(400).json({errors: err});
    }
    else {
      req.models.user.safeSave(user, function(err, user){
        if(err) throw err;
        var token = jwt.sign(user.serialize(), config.secret, { expiresInMinutes: 60*24 });
        res.json({ token: token , user: user.serialize()});
      });
    }
  });
}
exports.token = function(req, res) {
	req.models.user.findByEmailPassword(req.body.email, req.body.password, function(err, user){
		if(!user){
			res.status(400).json({errors: [{name: 'email', error: 'Wrong email or password'}]});
			return;
		}
		var token = jwt.sign(user.serialize(), config.secret, { expiresInMinutes: 60*24 });
  		res.json({ token: token , user: user.serialize()});

	});
};
