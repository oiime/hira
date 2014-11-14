process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var csv = require("fast-csv");
var fs = require('fs');
var models = require('../models');
var async = require('async');

var codes3_2 = {
  GIN: 'GN',
  LBR: 'LR',
  SLE: 'SL',
  MLI: 'ML',
  NGA: 'NG',
  SEN: 'SN'
}

function addEntry(obj, db, done){
  var create = function(obj){
    db.models.slocation.find({code: obj.code, country: obj.country}, function(err, rows){
      if(err) throw err;

      if(rows.length === 0){
        db.models.slocation.create([obj], function (err, rows) {
          done(err, rows[0]);
        });
      }
      else {
        console.log(rows[0].name + ' Already exists.');
        done(err, rows[0]);
      }
    });
  }
  if(typeof obj.parent_code !== 'undefined'){
    db.models.slocation.find({code: obj.parent_code, country: obj.country}, function(err, slocs){
      if(err) throw err;
      if(slocs.length > 0){
        obj.parent_id = slocs[0].id;
        obj.level = slocs[0].level + 1;
      }
      else {
        obj.level = 1;
      }
      create(obj);
    });
  }
  else {
    obj.level = 1;
    create(obj);
  }
}

function load_gn(db){
  csv
    .fromPath(__dirname+'/../../files/sloc/gin_adm.tsv', {delimiter: "\t"})
    .on("data", function(entry){

    })
    .transform(function (row, next) {
      var obj = {
        country: 'GN',
        name: row[0],
        code: row[1],
        latitude: 9.9327629,
        longitude:-11.3580295
      };
      if(row[3]){
        obj.parent_code = row[3];
      }
      addEntry(obj, db, function(){
        next(null, row);
      });
    })
    .on("end", function(){
         console.log("done GN");
    });

}
function load_lb(db){
  csv
    .fromPath(__dirname+'/../../files/sloc/lib_adm.tsv', {delimiter: "\t"})
    .on("data", function(entry){

    })
    .transform(function (row, next) {
      var obj = {
        country: 'LR',
        name: row[0],
        code: row[1],
        longitude:10.80,
        latitude: 6.3167
      };
      if(row[3]){
        obj.parent_code = row[3];
      }
      addEntry(obj, db, function(){
        next(null, row);
      });
    })
    .on("end", function(){
         console.log("done LB");
    });

}
function load_sl(db){
  csv
    .fromPath(__dirname+'/../../files/sloc/sle_adm.tsv', {delimiter: "\t"})
    .on("data", function(entry){

    })
    .transform(function (row, next) {
      var obj = {
        country: 'SL',
        name: row[0],
        code: row[1],
        longitude:13.2344,
        latitude: 8.4844
      };
      if(row[3]){
        obj.parent_code = row[3];
      }
      addEntry(obj, db, function(){
        next(null, row);
      });
    })
    .on("end", function(){
         console.log("done SL");
    });

}
function load_ordered(db){
  csv
    .fromPath(__dirname+'/../../files/sloc/ordered.tsv', {delimiter: "\t"})
    .on("data", function(entry){

    })
    .transform(function (row, next) {
      var obj = {
        country: codes3_2[row[1]],
        name: row[2],
        code: row[3]
      };
      if(row[5]){
        obj.parent_code = row[3];
      }
      addEntry(obj, db, function(){
        next(null, row);
      });
    })
    .on("end", function(){
         console.log("done ordered");
    });

}

models(function(err, db){
  //load_gn(db);
  //load_sl(db);
  //load_lb(db);
  load_ordered(db);
});
