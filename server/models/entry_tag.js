var async = require('async');

module.exports = function (orm, db) {
  var EntryTag = db.define('entry_tag', {
    entry_id      : { type: 'integer', required: true },
    tag_id        : { type: 'integer', required: true },
    type          : { type: 'text', required: true }
  });
  EntryTag.safeSave = function(entry_id, tags, cb) {
    var self = this;

    self.find({ entry_id: entry_id }).remove(function (err) {
        if(err){
          cb(err);
          return;
        }
        var seq = [];
        async.each(tags, function(id, done){
          db.models.tag.get(id, function(err, tag){
            seq.push({
              entry_id: entry_id,
              tag_id: tag.id,
              type: tag.type
            });
            done(err)
          })
        }, function(err){
          if(err){
            cb(err);
            return;
          }
          self.create(seq, function(err){
            cb(err);
          });
        });
    });
  };
};
