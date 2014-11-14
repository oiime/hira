'use strict';
var _ = require('lodash')
var Validator = require('jsonschema').Validator;

exports.validateAgainst = function(entry, schema, cb){
  var v = new Validator();
  var rsp = v.validate(entry, schema);
  if(rsp.errors.length > 0){
    var errors = [];
    rsp.errors.forEach(function(err){
      errors.push({name: err.property, error:err.message})
    });
    cb(errors);
  }
  else {
    cb(null, rsp.instance);
  }
}

exports.validateRole = function(role){
  return function(req, res,next){
    if(req.user.role === role){
      next();
    }
    else {
      res.status(401).json({error: 'bad role'});
      res.end();
    }
  }
}
