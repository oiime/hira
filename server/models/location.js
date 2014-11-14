var config = require('../config/environment');
var moment = require('moment');
var bcrypt = require('bcrypt');

module.exports = function (orm, db) {
  var Location = db.define('location', {
                createdAt:  { type: 'date'},
                geonameid: { type: 'serial', key:true},
                name: { type: 'text'},
                asciiname: { type: 'text'},
                alternatenames: { type: 'text'},
                latitude: { type: 'number', rational: true},
                longitude: { type: 'number', rational: true},
                feature_class: { type: 'text'},
                feature_code: { type: 'text'},
                country_code: { type: 'text'},
                cc2: { type: 'text'},
                admin_code: { type: 'text'},
                admin1_code: { type: 'text'},
                admin2_code: { type: 'text'},
                admin3_code: { type: 'text'},
                admin4_code: { type: 'text'},
                population:{ type: 'integer'},
                elevation: { type: 'integer'},
                dem: { type: 'text'},
                timezone: { type: 'text'}
  });
  Location.finder = function(q, countryCode, limit, cb){
    var params = [];
    var words = q.split(' ');
    var nums = [];
    var strings = [];
    var sql = "select * from location where ";
    var queries = ["feature_class in ('A', 'P')"];

    words.forEach(function(word){;
        if (/^\d+$/.test(word)){
            nums.push(word);
        }
        else if(word.length > 2) {
            strings.push(word);
        }
    });
    if(nums.length > 0){
        queries.push('admin_code IN (' + nums.join(',') + ') ');
    }
    if(strings.length > 0){
        queries.push( 'MATCH(name,asciiname,alternatenames) AGAINST (? IN BOOLEAN MODE) ' );
        params.push('*' + strings.join(' ') + '*');
    }
    if(queries.length === 0){
        cb(null, []);
        return;
    }
    sql += '(' + queries.join(' AND ') + ')';
    if(typeof countryCode !== 'undefined'){
        sql += ' AND country_code=? ';
        params.push(countryCode);
    }
    sql += " order by population desc limit " + parseInt(limit);
    db.driver.execQuery(sql,params, cb);
  }
};
