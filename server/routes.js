/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';

export default function(app) {
  // Insert routes below
  app.use('/api/users', require('./api/user'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);
}
