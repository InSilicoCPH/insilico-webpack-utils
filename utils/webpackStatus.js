/**
 * Display a status bar when bundling Webpack
 * @param webpackCompiler
 * @returns spinner
 */
module.exports = function webpackStatus(webpackCompiler) {
  var stream = process.stderr;
  var enabled = stream && stream.isTTY;

  if (!enabled || process.env.CI || process.env.BITBUCKET_COMMIT) {
    return function () {};
  }

  var webpack = require('webpack');
  var ProgressPlugin = require('webpack/lib/ProgressPlugin');
  var ora = require('ora');

  // Create the spinner
  var spinner = ora('Webpack bundling').start();

  webpackCompiler.apply(new ProgressPlugin((progress, msg) => {
    if (progress >= 1) {
      spinner.stop();
    } else {
      spinner.text = msg;
    }
  }));

  return spinner;
};
