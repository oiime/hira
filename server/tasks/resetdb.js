process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var models = require('../models/');
var c = require('../const');

models(function (err, db) {
  if (err) throw err;
	console.log('models');
  db.drop(function (err) {
    if (err) throw err;
	console.log('drop');
    db.sync(function (err) {
      if (err) throw err;
	console.log('sync');
      db.models.user.create({
        name: "ADMIN", email: "admin@example.com", password: "123456", role: c.ROLE_ADMIN
      }, function (err, message) {
        if (err) throw err;

        db.close()
        console.log("Done!");
      });
    });
  });
});
