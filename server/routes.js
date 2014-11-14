/**
 * Main application routes
 */

'use strict';

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

  app.route('/:url(api|auth|app|bower_components|assets|documents)/*')
   .get(function(req, res){
      res.status(404).json({error: 'Page not found'});
   });

  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
