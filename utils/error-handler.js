const chalk = require('chalk');
const notifier = require('node-notifier');

/**
 * Handle gulp errors
 * @param err
 * @param kill
 */
module.exports = function(err, kill) {
  if (typeof kill === 'undefined') kill = true;
  err = err || {};
  const name = err.name;

  notifier.notify({
    title: name || err.plugin || 'Error',
    message: err.message,
    sound: "Submarine",
  });

  /**
   * Stop the stream on error
   */
  if (kill && !process.env.WATCHING === 'true') {
    throw new Error(err.message);
  } else {
    if (name !== 'Error') {
      console.log(chalk.cyan(name) + ':');
    }
    console.error(chalk.red(err.message));

    if (typeof this.emit !== "undefined") {
      this.emit('end');
    }
  }
};
