var exec = require('child_process').exec;

module.exports = function supportsYarn() {
  return new Promise((resolve, reject) => {
    exec('yarn --version', function (err, stdout, stderr) {
      if (err) reject();
      else resolve(stdout);
    });
  });
};