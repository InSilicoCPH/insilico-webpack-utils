var exec = require('child_process').exec;

/**
 * Get the current branch name
 * @returns {Promise}
 */
function getCurrentBranch() {
  return new Promise((resolve, reject) => {
    exec('git rev-parse --abbrev-ref HEAD', (err, stdout) => {
      if (err) reject(err);
      else {
        resolve(stdout.trim());
      }
    });
  })
}

module.exports = getCurrentBranch;