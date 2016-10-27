// module.exports = {
//   plugins: {
//     watchMissing: require('./plugins/WatchMissingNodeModulesPlugin')
//   },
//   tasks: {
//     eslint: require('./tasks/eslint'),
//     jest: require('./tasks/jest'),
//     stylelint: require('./tasks/stylelint')
//   },
//   utils: {
//     currentBranch: require('./utils/current-branch'),
//     devTerminal: require('./utils/dev-terminal'),
//     errorHandler: require('./utils/error-handler'),
//     status: require('./utils/webpackStatus'),
//   },
// };

const gulp = require('gulp');
const path = require('path');

function init(config) {
  gulp.task('commit', require('./tasks/commit'));
}

module.exports = init;