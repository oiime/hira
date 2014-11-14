var orm = require('orm');
var config = require('../config/environment');

var connection = null;

function setup(db, cb) {
  require('./user')(orm, db);
  require('./location')(orm, db);
  require('./tag')(orm, db);
  require('./source')(orm, db);
  require('./slocation')(orm, db);
  require('./entry')(orm, db);
  require('./entry_tag')(orm, db);
  require('./entry_slocation')(orm, db);
  require('./document')(orm, db);

  return cb(null, db);
}

module.exports = function (cb) {
  if (connection) return cb(null, connection);

  orm.connect(config.db, function (err, db) {
    if (err) return cb(err);

    connection = db;
    db.settings.set('instance.returnAllErrors', true);
    setup(db, cb);
  });
};

