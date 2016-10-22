/**
 * Express configuration
 */

'use strict';

//import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import errorHandler from 'errorhandler';
//import path from 'path';
//import lusca from 'lusca';
import passport from 'passport';

export default function(app) {
  var env = app.get('env');

  app.use(morgan('dev'));
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(passport.initialize());

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

  if(env === 'development' || env === 'test') {
    app.use(errorHandler()); // Error handler - has to be last
  }
}
