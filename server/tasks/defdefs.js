'use strict';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var csv = require("fast-csv");
var fs = require('fs');
var models = require('../models');
var async = require('async');
var c = require('../const');


var loadfile = function(filename, done, cbEntry){
  var rows = [];
  console.log('started ' + filename);
  csv
      .fromPath(__dirname+'/../../files/' + filename, {delimiter: "\t"})
      .on("data", function(data){
          rows.push(data);
      })
      .on("end", function(){
        console.log(rows);
        async.eachLimit(rows, 5, function(entry, done){
          cbEntry(entry, done);
        }, function(err){
          if(err){
            console.log('meh' + err);
          }
          console.log('finished ' + filename);
          done();
        });
      });
};
models(function(err, db){
  db.driver.execQuery("TRUNCATE tag", function (err, data){
    async.series([
      function(done){
        loadfile('interests.txt', done, function(entry, done){
          db.models.tag.create([{
                  name: entry[1],
                  type: 'interest',
                  data: {
                    sector: entry[0],
                    subsector: entry[1],
                    desc: entry[2]
                  }}
          ], function (err, items) {
            done(err);
          });
        });
      },
      function(done){
        loadfile('affected.txt', done, function(entry, done){
          db.models.tag.create([{
                  name: entry[0],
                  type: 'affected',
                  data: {
                    name: entry[0],
                  }}
          ], function (err, items) {
            done(err);
          });
        });
      },
      function(done){
        loadfile('informationtype.txt', done, function(entry, done){
          db.models.tag.create([{
                  name: entry[0],
                  type: 'informationtype',
                  data: {
                    name: entry[0],
                  }}
          ], function (err, items) {
            done(err);
          });
        });
      },
      function(done){
        loadfile('responsecategory.txt', done, function(entry, done){
          db.models.tag.create([{
                  name: entry[0],
                  type: 'responsecategory',
                  data: {
                    name: entry[0],
                  }}
          ], function (err, items) {
            done(err);
          });
        });
      },
      function(done){
        loadfile('sourcetypes.txt', done, function(entry, done){
          db.models.tag.create([{
                  name: entry[0],
                  type: 'sourcetype',
                  data: {
                    name: entry[0],
                  }}
          ], function (err, items) {
            done(err);
          });
        });
      }
    ], function(err){
      console.log('done aggregate');
    });
  });
});
