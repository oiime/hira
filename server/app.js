/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
// Setup server
var app = express();
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var server = require('http').createServer(app);

app.use('/api', expressJwt({secret: config.secret}).unless({path: [
    '/api/auth/token',
    '/api/auth/register',
    '/api/expose/sql/data',
    '/api/expose/sql/structure',
    '/api/expose/csv/entries',
    '/api/expose/json/entries'
]}));

app.use(function(err, req, res, next){
	if (err.constructor.name === 'UnauthorizedError') {
		res.status(401).send('Unauthorized');
	}
});

require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
