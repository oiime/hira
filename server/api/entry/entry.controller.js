'use strict';
var _ = require('lodash');
var helpers = require('../helpers');
var c = require('../../const');

var entrySchema = {
  "id": "/Entry",
  "type": "object",
  "properties": {
    "id": {"type": "integer", "minimum": 1},
    "excerpt": {"type": "string"},
    "source_id": {"type": "integer", "minimum": 1, "required": true},
    "reliability": {"type": "integer", "minimum": 1, "required": true},
    "severity": {"type": "integer", "minimum": 0, "required": true},
    "slocations": {
      "type": "array",
      "minimum": 1,
      "items": {
        "type": "object",
        "properties": {
          "country": {"type": "string", "minimum": 1, "required": true},
          "id": {"type": "integer", "minimum": 1}
        }
      }
    },
    "tags": {
      "type": "array",
      "minimum": 1,
      "items": {
        "type": "integer", "minimum": 1
      }
    }
  }
};

exports.finder = function(req, res){
  req.models.entry.finder(req.body, function(err, records){
    if(err) throw err;
    res.json(records);
  });
};
exports.delete = function(req, res){
  req.models.entry.get(req.params.id, function(err, entry){
    if(err) throw err;
    entry.status = c.STATUS_DELETED;
    entry.save(function(err){
      if(err) throw err;
      res.json({deleted: req.params.id});
    });
  })
};
exports.get = function(req, res) {
  if(!req.params.id){
    res.status(404).json({});
    return;
  }
  req.models.entry.safeGet(req.params.id, function(err, entry){
    res.json(entry);
  })
};
exports.changeStatus = function(req, res){
  if(!req.params.id || !req.body.status){
    res.status(404).json({});
    return;
  }
  req.models.entry.get(req.params.id, function(err, entry){
    if(err){
      res.status(404).json({});
      return;
    }
    entry.status = req.body.status;
    entry.save(function(err){
      req.models.entry.safeGet(req.params.id, function(err, entry){
        res.json(entry);
      })
    });
  })
};
exports.save = function(req, res) {
  helpers.validateAgainst(req.body, entrySchema, function(err, entry){
    if(err){
      res.status(400).json({errors: err});
    }
    else {
      if(req.params.id){
        entry.id = req.params.id;
      }
      entry.user_id = req.user.id;
      req.models.entry.safeSave(entry, function(err, row){
        if(err) throw err;
        req.models.entry.safeGet(row.id, function(err, entry){
          res.json(entry);
        })
      });
    }
  });
};
