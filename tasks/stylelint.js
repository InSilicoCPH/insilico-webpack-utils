const path = require('path');
const errorHandler = require('../utils/error-handler');
const terminal = require('../utils/dev-terminal');

let invalidCache = [];
let lastRunErrors = false;

module.exports = function stylelint(src) {
  //If watch mode, start watching for changes.
  src = src || path.join(process.cwd(), 'src/**/*.css');
  const isWatching = process.env.WATCHING === 'true';
  const gulp = require('gulp');

  if (isWatching) {
    const watcher = gulp.watch(src);
    watcher.on('change', (path) => {
      if (terminal.hasBundler()) {
        terminal.clearMessages('Stylelint');
      }

      runStylelint(src, path);
    });
  }

  return runStylelint(src);
};

function runStylelint(src, file) {
  const gulp = require('gulp');
  const postcss = require('gulp-postcss');
  const isBundling = terminal.hasBundler();
  const isWatching = process.env.WATCHING === 'true';

  if (file) {
    src = invalidCache.concat(file);
  }
  let currentWarnings = [];

  return gulp.src(src)
    .pipe(postcss([
      require('stylelint')({ /* your options */ }),
      require('postcss-reporter')({
        formatter: isBundling ? (input => {
          currentWarnings.push(input);
          return '';
        }) : null,
        clearMessages: true,
        throwError: !isWatching,
      }),
    ]))
    .on('error', (err) => {
      if (!isBundling) errorHandler(err);
    })
    .on('finish', () => {
      if (isBundling) {
        terminal.setPostCSSResult('Stylelint', currentWarnings);
      }

      invalidCache = currentWarnings.map(result => result.source);
      lastRunErrors = currentWarnings.length > 0;
    })
}