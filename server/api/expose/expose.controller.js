'use strict';

var _ = require('lodash');
var spawn = require('child_process').spawn;
var csv = require('fast-csv');

// Get list of exposes
exports.sqldumpData = function(req, res) {
  var dump = spawn('mysqldump', ['-u','root','--no-create-info','dnu','entry','entry_tag','source','tag', 'slocation']);
  res.contentType('text/plain');
  dump.stdout.pipe(res);
  dump.on('close', function(code){

  });
};
exports.sqldumpStructure = function(req, res) {
  var dump = spawn('mysqldump', ['-u','root','--no-data', 'dnu']);
  res.contentType('text/plain');
  dump.stdout.pipe(res);
  dump.on('close', function(code){

  });
};
var processesEntries = function(req, rows, cb){
  var n_rows = [];
  req.models.tag.nameMap(function(tagnames){
    rows.forEach(function(row){
      row.tags.forEach(function(tag){
        if(typeof row[ tagnames[tag.id].type] === 'undefined'){
          row[ tagnames[tag.id].type ]= [];
        }
        row[ tagnames[tag.id].type ].push(tagnames[tag.id].name)
      })
      row.source.type = tagnames[row.source.type].name;

      delete row.tags;
      n_rows.push(row);
    })
    cb(n_rows);
  });
}
exports.jsonEntries = function(req, res) {
  res.contentType('application/json');
  req.models.entry.finder({}, function(err, data){
    if(err) throw err;
    processesEntries(req, data.records, function(records){
      data.records = records;
      res.json(data);
    });
  });
};
exports.csvEntries = function(req, res) {
  var csvStream = csv.createWriteStream({headers: true});
  req.models.entry.finder({}, function(err, data){
    processesEntries(req, data.records, function(records){
      csvStream.pipe(res);
      records.forEach(function(row){
        console.log(row);
        var orow = {
          id: row.id,
          country: row.country,
          severity: row.severity,
          excerpt: row.excerpt,
          reliability: row.reliability,
          slocations: JSON.stringify(row.slocations),
          interest: row.interest ? row.interest.join(',') : '',
          affected: row.affected ? row.affected.join(',') : '',
          informationtype: row.informationtype ? row.informationtype.join(',') : '',
          responsecategory: row.responsecategory ? row.responsecategory.join(',') : '',
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          source_link: row.source.link,
          source_type: row.source.type,
          source_date: row.source.date
        };
        csvStream.write(orow);
      })
      csvStream.end();
    });
  });
};
//mysqldump -u root --no-data dnu
//mysqldump -u root --no-create-info dnu entry,entry_tag,source,tag
