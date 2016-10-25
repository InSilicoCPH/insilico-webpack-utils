const bin = 'node_modules/.bin/jest';

function jestTask() {
  const spawn = require('child_process').spawn;

  const testEnv = Object.create( process.env );
  testEnv.NODE_ENV = 'test';

  const args = [];
  const isWatching = process.env.WATCHING === 'true';

  if (isWatching) {
    const terminal = require('../utils/dev-terminal');
    if (terminal.hasBundler()) {
      args.push('--watch'); // Watch
      args.push('--json');
      const childProcess = spawn(bin, args, {env: testEnv});
      childProcess.stdout.setEncoding('utf8');
      childProcess.stdout.on('data', (data) => {
        if (data.charAt(0) !== '{') return;
        let result;
        try {
          result = JSON.parse(data);
        } catch (err) {
          if (err.message && !err.message.includes('Unexpected')) {
            terminal.log(err.message);
          }
        }
        if (result) {
          if (done) {
            done();
            done = null;
          }
          terminal.setTestResult(result);
        }
      });
    } else {
      args.push('--watch'); // Watch
      spawn(bin, args, {stdio: 'inherit', env: testEnv});
      done();
    }
  } else {
    return spawn(bin, args, {stdio: 'inherit', env: testEnv});
  }
}

module.exports = jestTask;