'use strict';
var _ = require('lodash');
var helpers = require('../helpers');
var c = require('../../const');

var sourceSchema = {
  "id": "/Source",
  "type": "object",
  "properties": {
    "id": {"type": "integer", "minimum": 1},
    "type": {"type": "integer", "minimum": 1, "required": true},
    "link": {"type": "string", "required": true},
    "date": {"type": "datetime", "required": true},
  }
};

exports.finder = function(req, res){
  req.models.source.finder(req.body, function(err, records){
    if(err) throw err;
    res.json(records);
  });
};
exports.delete = function(req, res){
  req.models.source.get(req.params.id, function(err, source){
    if(err) throw err;
    source.status = c.STATUS_DELETED;
    source.save(function(err){
      if(err) throw err;
      req.models.entry.find({source_id: source.id}, function(err, entries){
        if(err) throw err;
        entries.forEach(function(entry){
          entry.status = c.STATUS_DELETED;
          entry.save(function(err){
            if(err) throw err;
          });
        });
        res.json({deleted: req.params.id});
      });
    });
  })
};
exports.get = function(req, res) {
  if(!req.params.id){
    res.status(404).json({});
    return;
  }
  req.models.source.safeGet(req.params.id, function(err, source){
    res.json(source);
  })
};
exports.changeStatus = function(req, res){
  if(!req.params.id || !req.body.status){
    res.status(404).json({});
    return;
  }
  req.models.source.get(req.params.id, function(err, source){
    if(err){
      res.status(404).json({});
      return;
    }
    source.status = req.body.status;
    source.save(function(err){
      req.models.source.safeGet(req.params.id, function(err, source){
        res.json(source);
      })
    });
  })
};
exports.save = function(req, res) {
  helpers.validateAgainst(req.body, sourceSchema, function(err, source){
    if(err){
      res.status(400).json({errors: err});
    }
    else {
      if(req.params.id){
        source.id = req.params.id;
      }
      console.log(req.user.id);
      source.user_id = req.user.id;
      req.models.source.safeSave(source, function(err, row){
        if(err) throw err;
        req.models.source.safeGet(row.id, function(err, source){
          res.json(source);
        })
      });
    }
  });
};
