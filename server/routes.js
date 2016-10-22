/**
 * Main application routes
 */

'use strict';

export default function(app) {
  // Insert routes below
  app.use('/api/users', require('./api/user'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/auth', require('./auth'));
}
