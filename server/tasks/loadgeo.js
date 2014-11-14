process.env.NODE_ENV = process.env.NODE_ENV || 'development';

Array.prototype.chunk = function(chunkSize) {
    var array=this;
    return [].concat.apply([],
        array.map(function(elem,i) {
            return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
        })
    );
}

var csv = require("fast-csv");
var fs = require('fs');
var models = require('../models');
var async = require('async');

/*
var aggregate = function(db, done){
  async.series([
    function(done){
      db.driver.execQuery("SELECT countrycode FROM location GROUP BY countrycode", function (err, data) {
        async.eachLimit(data, 5, function(entry, done){
          db.models.location.create([
              {
                  countrycode: entry.countrycode,
                  type: 3
              }
          ], function (err, items) {
            done(err);
          });
        }, function(err){
          done(err);
        });
      });
    },
    function(done){
      db.driver.execQuery("SELECT countrycode,region FROM location GROUP BY countrycode,region", function (err, data) {
        async.eachLimit(data, 5, function(entry, done){
          db.models.location.create([
              {
                  countrycode: entry.countrycode,
                  region: entry.region,
                  type: 2
              }
          ], function (err, items) {
            done(err);
          });
        }, function(err){
          done(err);
        });
      });
    }
  ], function(err){
    done(err);
    console.log('done aggregate');
  });
};
*/
models(function(err, db){
  var wstream = fs.createWriteStream('myOutput.txt');

  db.driver.execQuery("TRUNCATE location", function (err, data){
  });
  /*
    function(err, data){
      if(err){
        throw err;
      }
      data.forEach(function(entry){
        var obj = {
                geonameid: entry[0],
                name: entry[1],
                asciiname: entry[2],
                alternatenames: entry[3],
                latitude: entry[4],
                longitude: entry[5],
                feature_class: entry[6],
                feature_code: entry[7],
                country_code: entry[8],
                cc2: entry[9],
                admin1_code: entry[10],
                admin2_code: entry[11],
                admin3_code: entry[12],
                admin4_code: entry[13],
                population: entry[14],
                elevation: entry[15],
                dem: entry[16],
                timezone: entry[17]
            };

        var sql = 'INSERT INTO location (createdAt ';
        for (var field in obj) {
          sql += ',' + field;
        }
        sql += ') VALUES (NOW()';
        for (var field in obj) {
          sql += ',"' + db.driver.query.escapeVal(obj[field]) + '"';
        }
        sql += ');';
        wstream.write(sql + "\n");
      });
      wstream.end();

      /*
      async.eachLimit(groups, 5, function(entries, done){
        db.models.location.create(entries, function (err, items) {
          done(err);
        });
      }, function(err){
        if(err){
          throw err;
        }
        console.log('done parsing file');
        aggregate(db, function(err){

        });
      });

    });
    */
    // load

    csv
    .fromPath(__dirname+'/../../files/allCountries.txt', {delimiter: "\t"})
    .on("data", function(entry){
         var obj = {
                geonameid: entry[0],
                name: entry[1],
                asciiname: entry[2],
                alternatenames: entry[3],
                latitude: entry[4],
                longitude: entry[5],
                feature_class: entry[6],
                feature_code: entry[7],
                country_code: entry[8],
                cc2: entry[9],
                admin1_code: entry[10],
                admin2_code: entry[11],
                admin3_code: entry[12],
                admin4_code: entry[13],
                population: entry[14],
                elevation: entry[15],
                dem: entry[16],
                timezone: entry[17]
            };

        var sql = 'INSERT INTO location (createdAt ';
        for (var field in obj) {
          sql += ',' + field;
        }
        sql += ') VALUES (NOW()';
        for (var field in obj) {
          sql += ',' + db.driver.query.escapeVal(obj[field]);
        }
        sql += ');';
        console.log(sql + "\n");
    })
    .transform(function (row, next) {
      next(null, row);
    })
    .on("end", function(){
         //console.log("done");
    });
});
