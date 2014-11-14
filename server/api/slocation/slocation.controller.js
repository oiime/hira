'use strict';
var _ = require('lodash');
var helpers = require('../helpers');
var c = require('../../const');

var slocationSchema = {
  "id": "/Slocation",
  "type": "object",
  "properties": {
    "id": {"type": "integer", "minimum": 1},
    "parent_id": {"type": "integer", "minimum": 1},
    "country": {"type": "string", "minimum": 2, "required": true},
    "name": {"type": "string", "minimum": 1, "required": true},
    "code": {"type": "string", "minimum": 1, "required": true},
  }
};

exports.finder = function(req, res){
  req.models.slocation.finder(req.body, function(err, records){
    if(err) throw err;
    res.json(records);
  });
};
exports.delete = function(req, res){
  req.models.slocation.find({id: req.params.id}).remove(function(err){
    if(err) throw err;
    res.json({deleted: req.params.id});
  });
};
exports.get = function(req, res) {
  if(!req.params.id){
    res.status(404).json({});
    return;
  }
  req.models.slocation.safeGet(req.params.id, function(err, slocation){
    res.json(slocation);
  })
};
exports.save = function(req, res) {
  helpers.validateAgainst(req.body, slocationSchema, function(err, slocation){
    if(err){
      res.status(400).json({errors: err});
    }
    else {
      if(req.params.id){
        slocation.id = req.params.id;
      }
      req.models.slocation.safeSave(slocation, function(err, row){
        if(err) throw err;
        req.models.slocation.safeGet(row.id, function(err, slocation){
          res.json(slocation);
        })
      });
    }
  });
};
