/**
 * This is based on dev output from create-react-app
 * https://github.com/facebookincubator/create-react-app/blob/master/packages/react-dev-utils/formatWebpackMessages.js
 */
const path = require('path');
const chalk = require('chalk');
const chokidar = require('chokidar');
const clearConsole = require('react-dev-utils/clearConsole');
const formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
const testFormatter = require('./formatters/jest-formatter');
const esLintFormatter = require('./formatters/stylish.js');
const postcssFormatter = require('postcss-reporter/lib/formatter')();

let firstRun = true;
let firstTestRun = false;
let isCompiling = false;
let webpackChanged = false;
let hasErrors = false;
let hasWarnings = false;
let hasEslintErrors = false
let hasEslintWarnings = false
let webpackBundler = null;
let useJest = false;
let logMessages = [];
let messages = {};
let testResult = null;
let failedTests = false;
let startTime = new Date().getTime();

function getStatus() {
  return {
    hasEslintErrors: hasEslintErrors,
    hasEslintWarnings: hasEslintWarnings,
    hasErrors: hasErrors,
    hasWarnings: hasWarnings,
    isCompiling: isCompiling
  }
}

function watchForChanges(watch) {
  const watcher = chokidar.watch(path.join(watch, '/**/*.*'));

  watcher.on('change', (file, stats) => {
    if (!isCompiling && !firstTestRun && !firstRun) {
      webpackChanged = false;
      clearConsole();
      clearMessages();

      const log = [
        'Changed:',
        chalk.cyan(path.relative(watch, file))
      ];

      if (stats) {
        log.unshift(chalk.grey(new Date(stats.ctime).toLocaleTimeString('da-DK', {hour12: false})));
      }
      console.log(log.join(' '))
    }
  });
}

function clearMessages(name) {
  if (name) delete messages[name];
  else {
    messages = {};
  }
}

function setupBundler(bundler, opts) {
  if (opts && opts.watch) {
    watchForChanges(opts.watch);
  }
  webpackBundler = bundler;

  bundler.hooks.invalid.tap('dev-terminal', () => {
    isCompiling = true;
    webpackChanged = true;
    hasErrors = hasWarnings = false;
    //console.log('Compiling...');
    startTime = new Date().getTime()
  });

  bundler.hooks.done.tap('dev-terminal', (stats) => {
    const endTime = new Date().getTime()
    let dontClear = false;
    if (!firstRun) {
      // clearConsole();
    } else {
      dontClear = true;
      firstRun = false;
    }

    isCompiling = false;
    hasErrors = stats.hasErrors();
    hasWarnings = stats.hasWarnings();
    if (!hasErrors && !hasWarnings && !failedTests) {
      const time = `${endTime - startTime} ms`;
      console.log(`${chalk.green('Compiled successfully!')} ${chalk.grey('in ' + time)}`);

      logOutput(dontClear);

      clearMessages();
      testResult = null;
      return;
    } else {
      logMessages.length = 0;
      clearMessages();
    }

    // Use false as param, since the stats object will still contain errors/warnings - Also fixes issues with duplicate errors.
    const rawMessages = stats.toJson({}, false);
    const webpackMessages = formatWebpackMessages(rawMessages);


    if (hasErrors) {
      console.log(chalk.red('Failed to compile.'));
      console.log();
      webpackMessages.errors.forEach((message) => console.log(message));
      return;
    }

    if (failedTests && testResult) {
      outputTestResult();
      failedTests = false;
      return;
    }

    if (hasWarnings) {
      console.log(chalk.yellow('Compiled with warnings.'));
      console.log();
      webpackMessages.warnings.forEach((message) => console.log(message));
    }
  });
}

function logOutput(dontClear) {
  if (!webpackChanged && !firstTestRun && !firstRun && !dontClear) clearConsole();

  if (testResult) {
    outputTestResult();
  }

  // Output the current messages
  Object.keys(messages).forEach(key => {
    output(key)
  });

  if (logMessages && logMessages.length) {
    console.log(logMessages.join('\n'));
    logMessages.length = 0;
  }

}

function output(name) {
  if (!isCompiling && messages[name] && !failedTests ) {
    console.log(chalk.yellow(`\n${name} reported.`));
    console.log(messages[name]);
  }
}

function outputTestResult() {
  if (!isCompiling && testResult) {
    console.log(testResult);
    testResult = null;
  }
}

function hasBundler() {
  return webpackBundler !== null;
}

function log(msg) {
  logMessages.push(msg);
}

function setESLintResult(results) {
  messages['ESLint'] = results && results.length ? esLintFormatter(results) : null;
  if (results) {
    hasEslintErrors = results.some(item => item.errorCount > 0)
    hasEslintWarnings = results.some(item => item.warningCount > 0)

    output('ESLint')
  }

}

function setPostCSSResult(name, results) {
  messages[name] = formatPostCSS(results);
  output(name);
}

function setIsTesting() {
  firstTestRun = true;
  useJest = true;
}

function setTestResult(result) {
  testResult = testFormatter(result);
  failedTests = result.numFailedTests > 0;

  // Clear the console if not compiling
  if (!isCompiling && !firstTestRun && !hasErrors && !hasWarnings) {
    logOutput();
  } else if (firstTestRun) {
    firstTestRun = false;
    outputTestResult();
  }
}

function formatPostCSS(results) {
  let msg = '';
  if (results) {
    for (let i = 0; i < results.length; i++) {
      msg += postcssFormatter(results[i]);
    }
  }

  return msg;
}

module.exports = {
  log,
  getStatus,
  clearMessages,
  hasBundler,
  setupBundler,
  setESLintResult,
  setPostCSSResult,
  setTestResult,
  setIsTesting,
};