'use strict';

var _ = require('lodash');

exports.finder = function(req, res) {
  req.models.location.finder(req.body.q, req.body.countryCode, 50, function(err, data){
    if(err){
      throw err;
    }
    res.json({ records: data});
  });
};
