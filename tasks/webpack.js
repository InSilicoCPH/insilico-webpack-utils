var gulp = require('gulp');
var gutil = require('gulp-util');
var os = require('os');
var chalk = require('chalk');
var status = require('../utils/webpackStatus');

/**
 * Compile a Webpack config file.
 * Watches if 'process.env.WATCHING' is true.
 * @param webpackConfig {object} The Webpack config file
 * @returns {Promise}
 */
module.exports = function compileWebpack(webpackConfig) {
  const webpack = require('webpack');
  const compiler = webpack(webpackConfig);

  // Output the compiler status
  status(compiler);

  return new Promise((resolve, reject) => {
    if (process.env.WATCHING === 'true') {
      // You should run the 'server' instead
      compiler.watch({}, (err, stats) => {
        if (stats.hasErrors()) {
          const statDetails = stats.toJson({errorDetails: false});
          // print out parse errors
          statDetails.errors.forEach((e) => console.log(filterStackTraces(e)));
        } else {
          gutil.log('Webpack compiled in:', chalk.magenta(stats.endTime - stats.startTime + ' ms'));
        }

        if (resolve) {
          resolve();
          resolve = null;
        }
      });
    } else {
      compiler.run((err, stats) => {
        if (err) {
          return reject(new gutil.PluginError('webpack', err));
        } else if (stats.hasErrors()) {
          const statDetails = stats.toJson({errorDetails: false});
          // print out parse errors
          statDetails.errors.forEach((e) => console.log(filterStackTraces(e)));
          return reject(new gutil.PluginError('webpack', 'Failed to package for Webpack'));
        } else {
          if (Array.isArray(stats.stats)) {
            for (var i = 0; i < stats.stats.length; i++) {
              logName(stats.stats[i]);
              logStat(stats.stats[i]);
            }
          } else {
            logStat(stats);
          }
        }

        function logName(stat) {
          console.log(`Compiled: ${chalk.bold.magenta(stat.compilation.compiler.name)}`);
        }

        function logStat(stat) {
          console.log(stat.toString({
            // output options
            version: false,
            colors: true,
            timings: true,
            assets: true,
            modules: false,
            reasons: true,
            chunks: false,
            children: false,
            chunkModules: false,
          }));
        }

        resolve();
      })
    }
  })
};

function filterStackTraces(err) {
  return err.toString()
    .split(/[\r\n]+/)
    .filter(line => ! line.match(/^\s+at /))
    .join(os.EOL);
}
