/**
 * Display a progressbar when bundling Webpack
 * @param options
 * @returns {*}
 */
module.exports = function ProgressBarPlugin(options) {
  options = options || {};

  var stream = options.stream || process.stderr;
  var enabled = stream && stream.isTTY;

  if (!enabled || process.env.CI || process.env.BITBUCKET_COMMIT) {
    return function () {};
  }

  var objectAssign = require('object-assign');
  var chalk = require('chalk');
  var webpack = require('webpack');
  var ProgressBar = require('node-progress');

  var preamble = chalk.cyan.bold(options.preamble || 'Building ' + (options.name ? ':name ' : ''));
  //var bar = chalk.bold('[') + ':bar' + chalk.bold(']');
  var schema = options.format || preamble + chalk.magenta(':elapseds') + chalk.green(' :msg');
  delete options.format;
  delete options.total;
  delete options.stream;
  delete options.summary;

  var barOptions = objectAssign({
    schema: schema,
    total: 100,
    clear: true
  }, options);

  var bar = new ProgressBar(barOptions);
  var lastPercent = 0;
  return new webpack.ProgressPlugin((percent, msg) => {
    var newPercent = Math.floor(percent * 100);

    if (bar && newPercent != lastPercent ) {
      bar.tick(percent, {
        msg: msg,
        name: options.name,
      });

      lastPercent = newPercent;
    }
  });
};
