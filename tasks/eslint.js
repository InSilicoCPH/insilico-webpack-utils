const path = require('path');
const errorHandler = require('../utils/error-handler');
const terminal = require('../utils/dev-terminal');

let invalidCache = [];
let lastRunErrors = false;

module.exports = function eslint(src) {
  //If watch mode, start watching for changes.
  src = src || path.join(process.cwd(), 'src/**/*.js');
  const isWatching = process.env.WATCHING === 'true';

  if (isWatching) {
    const watcher = gulp.watch(src);
    watcher.on('change', (path) => {
      if (terminal.hasBundler()) {
        terminal.clearMessages('ESLint');
      }

      if (path.endsWith('js')) {
        runEslint(path);
      } else {
        runEslint();
      }
    });
  }

  return runEslint(src);
};

function runEslint(src, file) {
  const gulp = require('gulp');
  const gutil = require('gulp-util');
  const eslint = require('gulp-eslint');
  const isBundling = terminal.hasBundler();
  const isWatching = process.env.WATCHING === 'true';

  if (file) {
    src = invalidCache.concat(file);
  }
  let lintResults = [];

  return gulp.src(src)
    .pipe(eslint())
    .pipe(!isBundling ? eslint.format() : gutil.noop())
    .pipe(isWatching ? eslint.result((result) => {
      if (result.warningCount || result.errorCount) {
        lintResults.push(result);
      }
    }) : gutil.noop())
    .on('error', (err) => {
      if (!isBundling) errorHandler(err);
    })
    .pipe(!isWatching ? eslint.failAfterError() : gutil.noop())
    .on('finish', () => {
      if (isBundling) {
        // Pass the result to the shared terminal
        terminal.setESLintResult(lintResults);
      }

      invalidCache = lintResults.map(result => result.filePath);
      lastRunErrors = lintResults.length > 0;
    })
}