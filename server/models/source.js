var config = require('../config/environment');
var moment = require('moment');
var async = require('async');
var c = require('../const');
var url = require('url');

module.exports = function (orm, db) {
  var Source = db.define('source', {
    user_id   : { type: 'integer', required: true},
    type      : { type: 'integer', required: true },
    status    : { type: 'integer'},
    link      : { type: 'text'},
    site      : { type: 'text'},
    date      : { type: 'date'},
      createdAt   : { type: 'date', time: true },
    updatedAt   : { type: 'date', time: true }
  },
  {
    hooks: {
      beforeSave: function () {
        this.updatedAt = new Date();

        this.site = url.parse(this.link).hostname;
      },
      beforeCreate: function () {
        this.createdAt = new Date();
      }
    },
    methods: {
      serialize: function () {
        return {
          id        : this.id,
          type      : this.type,
          link      : this.link,
          status    : this.status,
          user_id   : this.user_id,
          site      : this.site,
          date      : this.date,
          createdAt : this.createdAt,
          updatedAt : this.updatedAt
        }
      }
    }
  });
  Source.finder = function(params, cb){
    var sql = '';
    var counter = false;
    var placeholders = [];
    var fields = [
      'source.id',
      'source.status',
      'source.type',
      'source.user_id',
      'source.date',
      'source.link',
      'source.site',
      'source.createdAt',
      'source.updatedAt',
      'user.name AS user_name',
      'COUNT(DISTINCT entry.id) AS entries_count',
      'GROUP_CONCAT(DISTINCT entry_slocation.country) AS countries'
    ];
    var where = [
      'source.status IN (' + c.STATUS_ACTIVE + ',' + c.STATUS_INACTIVE + ')'
    ];
    var join_modes = {
      'entry': 'LEFT',
      'entry_slocation': 'LEFT'
    };
    if(typeof params.status !== 'undefined' && params.status > 0){
      where.push('source.status=' + parseInt(params.status));
    }
    if(typeof params.country !== 'undefined' && params.country.length > 0){
      join_modes.entry = 'INNER';
      join_modes.slocation = 'INNER';
      where.push('slocation.country=?');
      placeholders.push(params.country);
    }
    if(typeof params._meta !== 'undefined' && typeof params._meta.count !== 'undefined' && params._meta.count===true){
      counter = true;
    }
    if(counter){
      fields = ['COUNT(DISTINCT source.id) AS counter'];
    }
    sql  = 'SELECT ' + fields.join(',') + ' FROM source ';
    sql += ' INNER JOIN user ON (user.id=source.user_id) ';
    sql += ' '+join_modes.entry+' JOIN entry ON (entry.source_id=source.id) ';
    sql += ' '+join_modes.entry_slocation+' JOIN entry_slocation ON (entry.id=entry_slocation.entry_id) ';
    sql += ' WHERE ' + where.join(' AND ');

    if(!counter){
      sql += ' GROUP BY source.id';
      sql += ' ORDER BY source.id DESC';
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
      var ids = [];
      rows.forEach(function(row, index){
        ids.push(row.id);
        rows[index] = {
          id: row.id,
          user: {name: row.user_name},
          entries_count: row.entries_count,
          countries: row.countries,
          status: row.status,
          user_id: row.user_id,
          link: row.link,
          site: row.site,
          type: row.type,
          date: row.date,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          documents: []
        };
      });
      db.models.document.find({source_id: ids, status: c.STATUS_ACTIVE}, function(err, documents){
        if(err) throw err;
        var map = {};
        documents.forEach(function(document){
          if(typeof map[document.source_id] === 'undefined'){
            map[document.source_id] = [];
          }
          map[document.source_id].push(document.serialize());
        });
        rows.forEach(function(row, index){
            if(typeof map[row.id] !== 'undefined'){
              rows[index].documents = map[row.id];
            }
        })
        cb(null, { records: rows} );
      });
    });
  };
  Source.safeGet = function(id, cb){
    var obj = {};
    this.get(id, function(err, source){
      if(err){
        throw err;
      }
      if(!source){
        cb(null,null);
        return;
      }
      cb(null, source.serialize());
    });
  };
  Source.safeSave = function(source, cb){
    if(source.id > 0){
      this.get(source.id, function(err, row){
        row.type = source.type;
        row.link = source.link;
        row.type = source.type;
        row.date = source.date;
        row.save(function(err){
          cb(err, row);
        });
      });
    }
    else {
      source.status = c.STATUS_ACTIVE;
      this.create([source], function(err, rows){
        if(err){
          cb(err);
        } else {
          cb(null, rows[0]);
        }
      });
    }
  }
};
