'use strict';

var _ = require('lodash');
var fs = require('fs');
var config = require('../../config/environment');
var mime = require('mime');
var uuid = require('node-uuid');
var tmp = require('tmp');
var path = require('path');
var c = require('../../const');

exports.delete = function(req, res){
  req.models.document.get(req.params.id, function(err, document){
    if(err) throw err;
    document.status = c.STATUS_DELETED;
    document.save(function(err){
      if(err) throw err;
      res.json({deleted: req.params.id});
    });
  })
};
exports.post = function(req, res) {
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
    tmp.file(function _tempFileCreated(err, tmp_filename, fd, cleanupCallback) {
      var tmp_file = fs.createWriteStream(tmp_filename);
      file.pipe(tmp_file);
      tmp_file.on('close', function () {
        var ext = path.extname(filename||'').split('.');
        ext = ext[ext.length - 1];

        req.models.document.safeSave({
          refname: uuid.v4() +'.' + ext,
          filename: filename,
          source_id: (typeof req.query.source_id === 'undefined') ? 0 : req.query.source_id,
          user_id: req.user.id
        } , function(err, document){
          if(err) throw err;
          fs.createReadStream(tmp_filename)
              .pipe(fs.createWriteStream(config.document_dir + '/' + document.refname))
              .on('close', function(){
                cleanupCallback();
                res.json(document.serialize());
              });
        });
      });
    });
  });
};
