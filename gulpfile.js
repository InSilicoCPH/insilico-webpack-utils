/* global __dirname */
const gulp = require('gulp');

/**
 * Define gulp tasks
 */
gulp.task('stylelint', () => require('./tasks/stylelint')());
gulp.task('eslint', () => require('./tasks/eslint')());
gulp.task('jest', () => require('./tasks/jest')());

gulp.task('default', gulp.series('stylelint', 'eslint', 'jest'));
