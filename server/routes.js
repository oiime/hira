/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/user', require('./api/user'));
  app.use('/api/document', require('./api/document'));
  app.use('/api/slocation', require('./api/slocation'));
  app.use('/api/source', require('./api/source'));
  app.use('/api/expose', require('./api/expose'));
  app.use('/api/entry', require('./api/entry'));
  app.use('/api/tag', require('./api/tag'));
  app.use('/api/geo', require('./api/geo'));
  app.use('/api/auth', require('./api/auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets|documents)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
