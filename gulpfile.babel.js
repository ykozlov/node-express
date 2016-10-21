// Generated on 2016-09-19 using generator-angular-fullstack 4.0.4
'use strict';

import _ from 'lodash';
import del from 'del';
import gulp from 'gulp';
import path from 'path';
import gulpLoadPlugins from 'gulp-load-plugins';
import http from 'http';
import open from 'open';
import lazypipe from 'lazypipe';
import nodemon from 'nodemon';
import runSequence from 'run-sequence';

var plugins = gulpLoadPlugins();
var config;

const serverPath = 'server';
const templatesPath = 'templates';
const paths = {
  server: {
    scripts: [
      `!${serverPath}/config/local.env.sample.js`
    ],
    templates: [
      `${serverPath}/${templatesPath}/**/*`
    ],
    json: [`${serverPath}/**/*.json`]
  },
  dist: 'dist'
};

/********************
 * Helper functions
 ********************/

function onServerLog(log) {
  console.log(plugins.util.colors.white('[') +
        plugins.util.colors.yellow('nodemon') +
        plugins.util.colors.white('] ') +
        log.message);
}

/********************
 * Reusable pipelines
 ********************/

let lintServerScripts = lazypipe()
    .pipe(plugins.eslint, './.eslintrc')
    .pipe(plugins.eslint.format);

let transpileServer = lazypipe()
    .pipe(plugins.sourcemaps.init)
    .pipe(plugins.babel, {
      plugins: [
        'transform-class-properties',
        'transform-runtime'
      ]
    })
    .pipe(plugins.sourcemaps.write, '.');

/********************
 * Env
 ********************/

gulp.task('env:all', () => {
  let localConfig;
  try {
    localConfig = require(`./${serverPath}/config/local.env`);
  } catch(e) {
    localConfig = {};
  }
  plugins.env({
    vars: localConfig
  });
});
gulp.task('env:prod', () => {
  plugins.env({
    vars: {NODE_ENV: 'production'}
  });
});

/********************
 * Tasks
 ********************/


gulp.task('transpile:server', () => {
  return gulp.src(_.union(paths.server.scripts, paths.server.json))
        .pipe(transpileServer())
        .pipe(gulp.dest(`${paths.dist}/${serverPath}`));
});

gulp.task('copy-templates', () => {
  gulp.src(paths.server.templates)
    .pipe(gulp.dest(`${paths.dist}/${serverPath}/${templatesPath}`));
});

gulp.task('lint:scripts', cb => runSequence(['lint:scripts:server'], cb));


gulp.task('lint:scripts:server', () => {
  return gulp.src(['./server/**/*.js'])
        .pipe(lintServerScripts());
});

gulp.task('jscs', () => {
  return gulp.src(paths.server.scripts)
      .pipe(plugins.jscs())
      .pipe(plugins.jscs.reporter());
});

gulp.task('clean:tmp', () => del(['.tmp/**/*'], {dot: true}));

gulp.task('start:server', () => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  config = require(`./${serverPath}/config/environment`);
  nodemon(`-w ${serverPath} ${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('start:server:prod', () => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  config = require(`./${paths.dist}/${serverPath}/config/environment`);
  nodemon(`-w ${paths.dist}/${serverPath} ${paths.dist}/${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('start:inspector', () => {
  gulp.src([])
        .pipe(plugins.nodeInspector({
          debugPort: 5858
        }));
});

gulp.task('start:server:debug', () => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  config = require(`./${serverPath}/config/environment`);
  nodemon(`-w ${serverPath} --debug=5858 --debug-brk ${serverPath}`)
        .on('log', onServerLog);
});

gulp.task('watch', () => {
  plugins.watch(['./server/**/*.js'], function() {
    return gulp.src(['./server/**/*.js'])
            .pipe(lintServerScripts());
  });
});

gulp.task('serve', cb => {
  runSequence(
    [
      'clean:tmp',
      'lint:scripts',
      'env:all'
    ],
        'start:server',
        'watch',
        cb
    );
});

gulp.task('serve:debug', cb => {
  runSequence(
    [
      'clean:tmp',
      'lint:scripts',
      'env:all'
    ],
        'start:inspector',
        ['start:server:debug'],
        'watch',
        cb
    );
});

gulp.task('serve:dist', cb => {
  runSequence(
        'build',
        'env:all',
        'env:prod',
        ['start:server:prod'],
        cb);
});


/********************
 * Build
 ********************/

gulp.task('build', cb => {
  runSequence(
    [
      'clean:dist',
      'clean:tmp'
    ],
    'transpile:server',
    [
      'copy:server',
      'copy-templates'
    ]
    ,
    cb);
});

gulp.task('clean:dist', () => del([`${paths.dist}/!(.git*|.openshift|Procfile)**`], {dot: true}));

gulp.task('copy:server', () => {
  return gulp.src([
    'package.json'
  ], {cwdbase: true})
        .pipe(gulp.dest(paths.dist));
});
