var config = require('../config/environment');
var moment = require('moment');
var async = require('async');
var c = require('../const');

module.exports = function (orm, db) {
  var Entry = db.define('entry', {
    status      : { type: 'integer'},
    excerpt     : { type: 'text'},
    source_id   : { type: 'integer'},
    user_id     : { type: 'integer'},
    severity    : { type: 'integer'},
    reliability : { type: 'integer'},
    createdAt   : { type: 'date', time: true },
    updatedAt   : { type: 'date', time: true }
  },
  {
    hooks: {
      beforeSave: function () {
        this.updatedAt = new Date();
      },
      beforeCreate: function () {
        this.createdAt = new Date();
      }
    },
    validations: {
      user_id   : orm.enforce.ranges.number(1),
      source_id   : orm.enforce.ranges.number(1)
    },
    methods: {
      serialize: function () {
        return {
          id           : this.id,
          status       : this.status,
          excerpt      : this.excerpt,
          severity     : this.severity,
          user_id      : this.user_id,
          source_id    : this.source_id,
          reliability  : this.reliability,
          createdAt    : moment(this.createdAt).fromNow(),
          updatedAt    : moment(this.updatedAt).fromNow()
        }
      }
    }
  });
  Entry.finder = function(params, cb){
    var sql = '';
    var counter = false;
    var placeholders = [];
    var fields = [
      'entry.id',
      'entry.status',
      'entry.user_id',
      'entry.severity',
      'entry.reliability',
      'entry.excerpt',
      'entry.createdAt',
      'entry.updatedAt',
      'entry.source_id',
      'source.link AS source_link',
      'source.site AS source_site',
      'source.date AS source_date',
      'source.type AS source_type',
      'user.name AS user_name'
    ];
    var allowed_order = ['createdAt'];
    var where = [
      'entry.status IN (' + c.STATUS_ACTIVE + ',' + c.STATUS_INACTIVE + ')'
    ];
    if(typeof params.status !== 'undefined' && params.status > 0){
      where.push('entry.status=' + parseInt(params.status));
    }
    if(typeof params._meta !== 'undefined' && typeof params._meta.count !== 'undefined' && params._meta.count===true){
      counter = true;
    }
    if(counter){
      fields = ['COUNT(DISTINCT entry.id) AS counter'];
    }
    sql  = 'SELECT ' + fields.join(',') + ' FROM entry ';
    if(!counter){
      sql += ' INNER JOIN user ON (user.id=entry.user_id) ';
      sql += ' INNER JOIN source ON (source.id=entry.source_id) ';
    }
    if(typeof params.country !== 'undefined' && params.country.length > 0){
      sql += ' INNER JOIN entry_slocation ON (entry_slocation.entry_id=entry.id) ';
      sql += ' INNER JOIN slocation ON (entry_slocation.slocation_id=slocation.id) ';
      where.push('slocation.country=?');
      placeholders.push(params.country);
    }
    if(typeof params.tags !== 'undefined' && params.tags.length > 0){
      sql += ' INNER JOIN entry_tag ON (entry_tag.entry_id=entry.id)';
      var qm = [];
      params.tags.forEach(function(tag){
        qm.push('?');
        placeholders.push(tag);
      });
      where.push('entry_tag.tag_id IN (' + qm.join(',') + ')');
    }
    sql += ' WHERE ' + where.join(' AND ');

    if(!counter){
      sql += ' GROUP BY entry.id';

      if(typeof params.order !== 'undefined' && allowed_order.indexOf(params.order) >= 0){
        sql += ' ORDER BY entry.'+ params.order +' ' +
            ((typeof params.order_dir !== 'undefined' && params.order_dir.toUpperCase() === 'ASC')?'ASC':'DESC');
      }
    }

    if(typeof params._meta !== 'undefined' && typeof params._meta.limit !== 'undefined' && typeof params._meta.limit.limit !== 'undefined' && typeof params._meta.limit.offset !== 'undefined'){
      sql += ' LIMIT ' + parseInt(params._meta.limit.offset) + ',' + parseInt(params._meta.limit.limit)
    }
    db.driver.execQuery(sql,placeholders, function(err, srows){
      if(err) throw err;
      if(counter){
        cb(null, {_meta : { count : srows[0].counter}});
        return;
      }
      var ids = [];
      var rows = {};
      srows.forEach(function(row){
        ids.push(row.id)
        rows[row.id] = {
          id: row.id,
          user: {name: row.user_name},
          source: {
            link: row.source_link,
            site: row.source_site,
            date: row.source_date,
            type: row.source_type
          },
          status: row.status,
          excerpt: row.excerpt,
          user_id: row.user_id,
          severity: row.severity,
          reliability: row.reliability,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          slocations: [],
          tags: []
        };
      });
      // append
      async.series([
          function(done){
            db.models.entry_tag.find({entry_id: ids}, function(err, tags){
              if(err) throw err;
              tags.forEach(function(tag){
                rows[tag.entry_id].tags.push({id: tag.tag_id, type: tag.type});
              });
              done();
            });
          },
          function(done){
            db.models.entry_slocation.getLocations(ids, function(locmap){
              ids.forEach(function(id){
                rows[id].slocations = locmap[id];
              });
              done();
            });
          }
        ], function(err){
          if(err) throw err;
          var flattened = [];
          Object.keys(rows).forEach(function(id) {
            flattened.push(rows[id]);
          });
          flattened = flattened.sort(function(a, b){
            var y = a.id; var x = b.id;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
          });

          cb(null, { records: flattened} );
        });
      });
  };
  Entry.safeGet = function(id, cb){
    var obj = {};
    this.get(id, function(err, entity){
      if(err){
        throw err;
      }
      if(!entity){
        cb(null,null);
        return;
      }
      obj = entity.serialize();
      obj.tags = [];
      obj.slocations = [];

      async.series([
          function(done){
            db.models.entry_slocation.getLocations([obj.id], function(map){
              obj.slocations = map[obj.id];
              done();
            })
          },
          function(done){
            db.models.entry_tag.find({entry_id: obj.id}, function(err, tags){
              tags.forEach(function(tag){
                obj.tags.push({id: tag.tag_id, type: tag.type});
              })
              done();
            });
          },
          function(done){
            db.models.source.find({id: obj.source_id}, function(err, sources){
              if(err) throw err;
              if(sources.length > 0){
                obj.source = sources[0].serialize();
              }
              done();
            });
          }
        ],
        function(err){
          if(err) throw err;
          cb(null, obj);
        }
      );
    });
  };
  Entry.safeSave = function(data, cb){
    var afterSave = function(data, entry){
        async.series([
          function(done){
            db.models.entry_tag.safeSave(entry.id, data.tags, done)
          },
          function(done){
            db.models.entry_slocation.safeSave(entry.id, data.slocations, done)
          }
        ], function(err){
          cb(err, entry);
        });
    }
    if(data.id && data.id > 0){
      this.get(data.id, function(err, entry){
        if(err) throw err;

        if(!entry){
          cb(new Error('No Entry ' + data.id));
          return;
        }
        entry.user_id     = data.user_id;
        entry.source_id   = data.source_id;
        entry.excerpt     = data.excerpt;
        entry.severity    = data.severity;
        entry.reliability = data.reliability;

        entry.save(function(err){
          if(err) throw err;
          afterSave(data, entry);
        });
      });
    }
    else {
      this.create([
      {
          user_id      : data.user_id,
          status       : c.STATUS_ACTIVE,
          source_id    : data.source_id,
          excerpt      : data.excerpt,
          severity     : data.severity,
          reliability  : data.reliability,
      }], function(err, entries){
        if(err){
          cb(err);
        }
        else {
          afterSave(data, entries[0]);
        }
      });
    }
  }
};
