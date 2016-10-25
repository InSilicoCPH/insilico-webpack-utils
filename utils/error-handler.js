var gutil = require('gulp-util');
var notifier = require('node-notifier');

/**
 * Handle gulp errors
 * @param err
 * @param kill
 */
module.exports = function(err, kill) {
  if (typeof kill === 'undefined') kill = true;
  err = err || {};
  var name = err.name;

  notifier.notify({
    title: name || err.plugin || 'Error',
    message: err.message,
    sound: "Submarine",
  });

  /**
   * Stop the stream on error
   */
  if (kill && !process.env.WATCHING === 'true' && !gutil.env['force']) {
    throw new gutil.PluginError('Error', err);
  } else {
    if (name !== 'Error') {
      console.log(gutil.colors.cyan(name) + ':');
    }
    console.error(gutil.colors.red(err.message));

    if (typeof this.emit != "undefined") {
      this.emit('end');
    }
  }
};
