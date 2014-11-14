'use strict';
var _ = require('lodash');
var helpers = require('../helpers');
var c = require('../../const');


exports.finder = function(req, res){
  req.models.user.finder(req.body, function(err, records){
    if(err) throw err;
    res.json(records);
  });
};
exports.delete = function(req, res){
  req.models.user.get(req.params.id, function(err, user){
    if(err) throw err;
    user.status = c.STATUS_DELETED;
    user.save(function(err){
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
  req.models.user.safeGet(req.params.id, function(err, user){
    res.json(user);
  })
};
exports.changeStatus = function(req, res){
  if(!req.params.id || !req.body.status){
    res.status(404).json({});
    return;
  }
  req.models.user.get(req.params.id, function(err, user){
    if(err){
      res.status(404).json({});
      return;
    }
    user.status = req.body.status;
    user.save(function(err){
      req.models.user.safeGet(req.params.id, function(err, user){
        res.json(user);
      })
    });
  })
};
