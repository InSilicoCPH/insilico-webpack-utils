/* global __dirname */
const gulp = require('gulp');
const tasks = require('./index');

const path = require('path');
tasks({
  src: path.join('')
});

/**
 * Define gulp tasks
 */
gulp.task('stylelint', () => require('./tasks/stylelint')());
gulp.task('eslint', () => require('./tasks/eslint')());
gulp.task('jest', () => require('./tasks/jest')());

gulp.task('docs', () => require('./tasks/docs')('__tests__/components', 'dist/docs', '__tests__/json'));

gulp.task('default', gulp.series('stylelint', 'eslint', 'jest'));