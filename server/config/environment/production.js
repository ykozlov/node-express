'use strict';
/*eslint no-process-env:0*/

// Production specific configuration
// =================================
module.exports = {
    // Server IP
  ip: process.env.ip
    || undefined,

    // Server port
  port: process.env.port
    || 8080,

    // MongoDB connection options
  mongo: {
    uri: process.env.MONGODB_URI
        || process.env.MONGOHQ_URL
        || 'mongodb://localhost/express-node-dev'
  }
};
