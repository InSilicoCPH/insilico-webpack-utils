module.exports = {
  plugins: {
    watchMissing: require('./plugins/WatchMissingNodeModulesPlugin')
  },
  tasks: {
    jest: require('./tasks/jest')
  },
  utils: {
    currentBranch: require('./utils/current-branch'),
    devTerminal: require('./utils/dev-terminal'),
    errorHandler: require('./utils/error-handler'),
    status: require('./utils/webpackStatus'),
    yarnSupport: require('./utils/yarn-support'),
  },
};