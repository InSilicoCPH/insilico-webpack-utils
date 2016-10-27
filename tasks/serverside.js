var path = require('path');
var del = require('del');
var execa = require('execa');
var gutil = require('gulp-util');
var errorHandler = require('../utils/error-handler');
var status = require('../utils/webpackStatus');

/**
 * Compile the serverside Webpack build file, and test it.
 * @param webpackConfig
 * @param jestConfigFile
 * @returns {Promise}
 */
module.exports = function serverside(webpackConfig, jestConfigPath) {
  const testConfig = jestConfigPath|| path.join(process.cwd(), 'serverside/jest-config.json');

  return compileServer(webpackConfig)
    .then(() => testServer(testConfig));
};

function compileServer(webpackConfig) {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'server';

  const webpack = require('webpack');
  const compiler = webpack(webpackConfig);

  // Monitor compile status
  status(compiler);

  return new Promise((resolve, reject) => {
    if (process.env.WATCHING === 'true') {
      // You should run the 'server' instead
      compiler.watch({}, (err, stats) => {
        if (stats.hasErrors()) {
          console.log(stats.toString({
            // output options
            timings: false,
            hash: false,
            version: false,
            assets: false,
            chunkModules: false
          }));
        } else {
          gutil.log('Server bundle compiled in:', gutil.colors.magenta(stats.endTime - stats.startTime + ' ms'));
        }

        if (resolve) {
          resolve();
          resolve = null;
        }
      });
    } else {
      compiler.run((err, stats) => {
        process.env.NODE_ENV = originalEnv;

        if (err) {
          errorHandler(new gutil.PluginError('serverside', err));
        } else {
          if (stats.hasErrors()) {
            errorHandler(new Error(stats.toString({
              colors: true,
              timings: false,
              assets: false,
              errorDetails: true,
              chunks: false,
              children: false,
              modules: false,
            })));
          }

          resolve();
        }
      })
    }
  })


}

function testServer(testConfig) {
  const args = ['-c', testConfig];
  const isWatching = process.env.WATCHING === 'true';
  if (isWatching) args.push('--watch');

  const childProcess = execa('jest', args, { stdio: 'inherit'});

  return isWatching ? Promise.resolve() : childProcess;
}