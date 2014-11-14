var async = require('async');

module.exports = function (orm, db) {
  var EntrySlocation = db.define('entry_slocation', {
    entry_id      : { type: 'integer', required: true },
    slocation_id  : { type: 'integer', required: true },
    country       : { type: 'text', required: true },
  });
  EntrySlocation.getLocations = function(ids, cb){
    var rsp = {}, sql;
    ids.forEach(function(id){
      rsp[id] = [];
    });
    if(ids.length === 0){
        cb(rsp);
        return;
    }
    sql  = 'SELECT entry_slocation.entry_id,entry_slocation.country AS slocation_country,slocation.* FROM entry_slocation ';
    sql += ' LEFT JOIN slocation ON (slocation.id=entry_slocation.slocation_id) ';
    sql += ' WHERE  entry_slocation.entry_id IN ('+ ids.join(',') +') ';
    db.driver.execQuery(sql,function(err, rows){
      if(err) throw err;
      rows.forEach(function(row){
        var obj = { country: row.slocation_country };
        if(row.id > 0){
          obj = {
            id           : row.id,
            country      : row.country,
            parent_id    : row.parent_id,
            level        : row.level,
            name         : row.name,
            code         : row.code,
            latitude     : row.latitude,
            longitude    : row.longitude
          };
        }
        rsp[row.entry_id].push(obj);
      })
      cb(rsp);
    });
  };
  EntrySlocation.safeSave = function(entry_id, slocations, cb) {
    var self = this;
    self.find({ entry_id: entry_id }).remove(function (err) {
        if(err){
          cb(err);
          return;
        }
        var seq = [];
        async.each(slocations, function(slocation, done){
          if(slocation.id > 0){
            db.models.slocation.get(slocation.id, function(err, slocation){
              if(err) throw err;
              if(!slocation) throw new Error('slocation not found: ' + slocation.id);

              seq.push({
                entry_id: entry_id,
                country: slocation.country,
                slocation_id: slocation.id
              });
              done(err)
            })
          } else {
            seq.push({
              entry_id: entry_id,
              country: slocation.country,
              slocation_id: 0
            });
            done();
          }
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
