'use strict';

var _ = require('lodash');
var config = require('../../config/environment');
var helpers = require('../helpers');

var tagSchema = {
  "type": "object",
  "properties": {
    "type": {"type": "string", "minimum": 1, "required": true},
    "name": {"type": "string", "minimum": 1, "required": true}
  }
};
exports.finder = function(req, res) {
  req.models.tag.finder({}, function(err, data){
    res.json({records: data});
  });
};
exports.delete = function(req, res){
  req.models.tag.find({id: req.params.id} ).remove(function(err){
    if(err) throw err;
    req.models.entry_tag.find({tag_id: req.params.id}).remove(function(err){
      if(err) throw err;
      res.json({deleted: req.params.id});
    })
  });
};
exports.save = function(req, res) {
  helpers.validateAgainst(req.body, tagSchema, function(err, tag){
    if(err){
      res.status(400).json({errors: err});
    }
    else {
      if(req.params.id){
        tag.id = req.params.id;
      }
      req.models.tag.safeSave(tag, function(err, row){
        if(err) throw err;
        res.json(row.serialize);
      });
    }
  });
};
