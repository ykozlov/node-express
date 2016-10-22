/**
 * Main application file
 */

'use strict';

import express from 'express';
import mongoose from 'mongoose';
mongoose.Promise = require('bluebird');
import config from './config/environment';
import http from 'http';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import errorHandler from 'errorhandler';
import passport from 'passport';

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1); // eslint-disable-line no-process-exit
});

// Populate databases with sample data
if(config.seedDB) {
  require('./config/seed');
}

// Setup server
var app = express(),
  server = http.createServer(app),
  env = app.get('env');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(passport.initialize());

if(env === 'development' || env === 'test') {
  app.use(errorHandler()); // Error handler - has to be last
}

require('./routes').default(app);

// Start server
function startServer() {
  server.listen(config.port, config.ip, function(){
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;

/**
 * Lusca - express server security
 * https://github.com/krakenjs/lusca
 */
//if(env !== 'test' && 'development' !== env) {
////if(env !== 'test' && !process.env.SAUCE_USERNAME ) {
//  app.use(lusca({
//    csrf: {
//      angular: true
//    },
//    xframe: 'SAMEORIGIN',
//    hsts: {
//      maxAge: 31536000, //1 year, in seconds
//      includeSubDomains: true,
//      preload: true
//    },
//    xssProtection: true
//  }));
//}
//
