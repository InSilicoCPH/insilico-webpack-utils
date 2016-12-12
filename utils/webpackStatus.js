/**
 * Display a status bar when bundling Webpack
 * @param webpackCompiler
 * @returns spinner
 */
module.exports = function webpackStatus(webpackCompiler) {
  const stream = process.stderr;
  const enabled = stream && stream.isTTY;

  if (!enabled || process.env.CI || process.env.BITBUCKET_COMMIT) {
    return function () {};
  }

  const webpack = require('webpack');
  const ProgressPlugin = require('webpack/lib/ProgressPlugin');
  const ora = require('ora');

  // Create the spinner
  const spinner = ora('Webpack bundling').start();

  webpackCompiler.apply(new ProgressPlugin((progress, msg) => {
    if (progress >= 1) {
      spinner.stop();
    } else {
      spinner.text = msg;
    }
  }));

  return spinner;
};
