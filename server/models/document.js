var moment = require('moment');
var async = require('async');
var c = require('../const');

module.exports = function (orm, db) {
  var Document = db.define('document', {
    user_id     : { type: 'integer', required: true},
    filename    : { type: 'text', required: true },
    refname    : { type: 'text', required: true },
    source_id   : { type: 'integer', required: true},
    status      : { type: 'integer'},
    createdAt   : { type: 'date', time: true }
  },
  {
    hooks: {
      beforeCreate: function () {
        this.createdAt = new Date();
      }
    },
    methods: {
      serialize: function () {
        return {
          id        : this.id,
          filename  : this.filename,
          refname   : this.refname,
          user_id   : this.user_id,
          source_id : this.source_id,
          createdAt : this.createdAt,
          updatedAt : this.updatedAt
        }
      }
    }
  });
  Document.safeGet = function(id, cb){
    var obj = {};
    this.get(id, function(err, document){
      if(err){
        throw err;
      }
      if(!document){
        cb(null,null);
        return;
      }
      cb(null, document.serialize());
    });
  };
  Document.safeSave = function(document, cb){
    document.status = c.STATUS_ACTIVE;
    this.create([document], function(err, rows){
      if(err){
        cb(err);
      } else {
        cb(null, rows[0]);
      }
    });
  }
};
