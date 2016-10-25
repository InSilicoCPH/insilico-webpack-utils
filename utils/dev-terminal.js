/**
 * This is based on dev output from create-react-app
 * https://github.com/facebookincubator/create-react-app/blob/master/packages/react-dev-utils/formatWebpackMessages.js
 */
const chalk = require('chalk');
const testFormatter = require('./jest-formatter');
const esLintFormatter = require('eslint/lib/formatters/stylish.js');
const postcssFormatter = require('postcss-reporter/lib/formatter')();
const friendlySyntaxErrorLabel = 'Syntax error:';
const friendlyTypeErrorLabel = 'Type error:';

let firstRun = true;
let firstTestRun = true;
let isCompiling = false;
let hasErrors = false;
let hasWarnings = false;
let webpackBundler = null;
let logMessages = [];
let messages = {};
let testResult = null;
let failedTests = false;

function isLikelyASyntaxError(message) {
  return message.indexOf(friendlySyntaxErrorLabel) !== -1;
}

// This is a little hacky.
// It would be easier if webpack provided a rich error object.
function formatMessage(message) {
  return message
  // Make some common errors shorter:
    .replace(
      // Babel syntax error
      'Module build failed: SyntaxError:',
      friendlySyntaxErrorLabel
    )
    .replace(
      // Babel syntax error
      'Module build failed: TypeError::',
      friendlyTypeErrorLabel
    )
    .replace(
      // Webpack file not found error
      /Module not found: Error: Cannot resolve 'file' or 'directory'/,
      'Module not found:'
    )
    // Internal stacks are generally useless so we strip them
    .replace(/^\s*at\s.*:\d+:\d+[\s\)]*\n/gm, '') // at ... ...:x:y
    // Webpack loader names obscure CSS filenames
    .replace(/\.\/~\/css-loader.+!\.\/(.+)/g, chalk.bold.underline('$1'))
    // Underline the file name
    .replace(/^\.\/(.+)/g, chalk.bold.underline('$1'))
  ;
}

function clearConsole() {
  process.stdout.write('\x1bc');
}

function clearMessages(name) {
  if (name) delete messages[name];
  else {
    messages = {};
  }
}

function setupBundler(bundler) {
  webpackBundler = bundler;

  bundler.plugin('invalid', () => {
    isCompiling = true;
    hasErrors = hasWarnings = false;
    clearConsole();
    console.log('Compiling...');
  });

  bundler.plugin('done', (stats) => {
    if (!firstRun) {
      clearConsole();
    } else firstRun = false;

    isCompiling = false;
    hasErrors = stats.hasErrors();
    hasWarnings = stats.hasWarnings();

    if (!hasErrors && !hasWarnings && !failedTests) {
      const time = `${stats.endTime - stats.startTime} ms`;
      console.log(`${chalk.green('Compiled successfully!')} ${chalk.grey('in ' + time)}`);

      logOutput();

      messages = {};
      testResult = null;
      return;
    } else {
      logMessages.length = 0;
      messages = {};
    }

    // Use false as param, since the stats object will still contain errors/warnings - Also fixes issues with duplicate errors.
    const json = stats.toJson(false);

    var formattedErrors = json.errors.map(message =>
      'Error in ' + formatMessage(message)
    );
    var formattedWarnings = json.warnings.map(message =>
      'Warning in ' + formatMessage(message)
    );

    if (hasErrors) {
      console.log(chalk.red('Failed to compile.'));
      console.log();
      if (formattedErrors.some(isLikelyASyntaxError)) {
        // If there are any syntax errors, show just them.
        formattedErrors = formattedErrors.filter(isLikelyASyntaxError);
      }
      formattedErrors.forEach(message => {
        console.log(message);
        console.log();
      });
      // If errors exist, ignore warnings.
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
      formattedWarnings.forEach(message => {
        console.log(message);
        console.log();
      });
    }
  });
}

function logOutput() {
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
  messages['ESLint'] = esLintFormatter(results);
  output('ESLint');
}

function setPostCSSResult(name, results) {
  messages[name] = formatPostCSS(results);
  output(name);
}

function setTestResult(result) {
  testResult = testFormatter(result);
  failedTests = result.numFailedTests > 0;

  // Clear the console if not compiling
  if (!isCompiling && !firstTestRun) {
    //clearConsole();
    logOutput();
  } else if (firstTestRun) {
    firstTestRun = false;
    outputTestResult();
  }
}

function formatPostCSS(results) {
  let msg = '';
  if (results) {
    for (var i = 0; i < results.length; i++) {
      msg += postcssFormatter(results[i]);
    }
  }

  return msg;
}

module.exports = {
  log,
  clearMessages,
  hasBundler,
  setupBundler,
  setESLintResult,
  setPostCSSResult,
  setTestResult,
};