var config = require('../config/environment');
var moment = require('moment');
var async = require('async');
var c = require('../const');

module.exports = function (orm, db) {
  var Source = db.define('slocation', {
    country      : { type: 'text'},
    parent_id    : { type: 'integer'},
    level        : { type: 'integer'},
    name         : { type: 'text'},
    code         : { type: 'text'},
    latitude     : { type: 'number', rational: true},
    longitude    : { type: 'number', rational: true},
  },
  {
    methods: {
      serialize: function () {
        return {
          id           : this.id,
          country      : this.country,
          parent_id    : this.parent_id,
          level        : this.level,
          name         : this.name,
          code         : this.code,
          latitude     : this.latitude,
          longitude    : this.longitude
        }
      }
    }
  });
  Source.finder = function(params, cb){
    var sql = '';
    var counter = false;
    var placeholders = [];
    var fields = [
      'slocation.*',
      'slocation_parent.code AS parent_code',
      'slocation_parent.name AS parent_name',
    ];
    var where = [
      'slocation.country IS NOT NULL'
    ];
    if(typeof params.country !== 'undefined' && params.country.length > 0){
      where.push('slocation.country=?');
      placeholders.push(params.country);
    }
    if(typeof params.q !== 'undefined' && params.q.length > 0){
      where.push('(slocation.code LIKE ? OR slocation.name LIKE ?)');
      placeholders.push(params.q + '%');
      placeholders.push('%' + params.q + '%');
    }
    if(typeof params._meta !== 'undefined' && typeof params._meta.count !== 'undefined' && params._meta.count===true){
      counter = true;
    }
    if(counter){
      fields = ['COUNT(DISTINCT slocation.id) AS counter'];
    }
    sql  = 'SELECT ' + fields.join(',') + ' FROM slocation AS slocation';
    if(!counter){
      sql += ' LEFT JOIN slocation AS slocation_parent ON (slocation_parent.id=slocation.parent_id)'
    }
    sql += ' WHERE ' + where.join(' AND ');

    if(!counter){
      sql += ' ORDER BY slocation.level,slocation.code DESC';
    }

    if(typeof params._meta !== 'undefined' && typeof params._meta.limit !== 'undefined' && typeof params._meta.limit.limit !== 'undefined' && typeof params._meta.limit.offset !== 'undefined'){
      sql += ' LIMIT ' + parseInt(params._meta.limit.offset) + ',' + parseInt(params._meta.limit.limit)
    }
    db.driver.execQuery(sql,placeholders, function(err, rows){
      if(err) throw err;
      if(counter){
        cb(null, {_meta : { count : rows[0].counter}});
        return;
      }
      rows.forEach(function(row){
        row = {
          id           : row.id,
          country      : row.country,
          parent_id    : row.parent_id,
          level        : row.level,
          code         : row.code,
          name         : row.name,
          latitude     : row.latitude,
          longitude    : row.longitude
        };
      });

      cb(null, { records: rows} );
    });
  };
  Source.safeGet = function(id, cb){
    var obj = {};
    this.get(id, function(err, slocation){
      if(err){
        throw err;
      }
      if(!slocation){
        cb(null,null);
        return;
      }
      cb(null, slocation.serialize());
    });
  };
  Source.safeSave = function(slocation, cb){
    function setParent(slocation, cb){
      slocation.level = 1;
      slocation.parent_id = 0;
      if(typeof slocation.parent_id !== 'undefined' && slocation.parent_id > 0){
        this.get(slocation.parent_id, function(err, row){
          if(err) throw err;
          if(row){
            slocation.level = row.level +1;
            slocation.parent_id = row.parent_id;
          }
          cb(slocation);
        });
      }
      else {
        cb(slocation);
      }
    }

    setParent(slocation, function(slocation){
      if(slocation.id > 0){
        this.get(slocation.id, function(err, row){
          row.country      = slocation.country;
          row.code         = slocation.code;
          row.name         = slocation.name;
          row.level        = slocation.level;
          row.parent_id    = slocation.parent_id;
          row.latitude     = slocation.latitude;
          row.longitude    = slocation.longitude;

          row.save(function(err){
            console.log(err);
            cb(err, row);
          });
        });
      }
      else {
        this.create([slocation], function(err, rows){
          if(err){
            cb(err);
          } else {
            cb(null, rows[0]);
          }
        });
      }
    });
  }
};
