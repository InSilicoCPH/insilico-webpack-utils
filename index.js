module.exports = {
  plugins: {
    progressBar: require('./plugins/ProgressBarPlugin'),
    watchMissing: require('./plugins/WatchMissingNodeModulesPlugin')
  },
  tasks: {
    jest: require('./tasks/jest')
  },
  utils: {
    currentBranch: require('./utils/current-branch'),
    devTerminal: require('./utils/dev-terminal'),
    errorHandler: require('./utils/error-handler'),
    yarnSupport: require('./utils/yarn-support'),
  },
};