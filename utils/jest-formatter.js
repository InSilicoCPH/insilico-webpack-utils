const chalk = require('chalk');
const path = require('path');

const PASS = chalk.bgGreen.white.bold(' PASS ');
const FAIL = chalk.bgRed.white.bold(' FAIL ');

/**
 * Format Jest JSON output for the console
 * @param results
 * @returns {*}
 */
function formatter(results) {
  if (!results.numTotalTests) {
    // No tests
    return chalk.bold('No tests found related to files changed since last commit.');
  }

  let output = '';
  const passMsg = chalk.green(`${results.numPassedTests} test${results.numPassedTests == 1 ? '' : 's'} passed`);

  for (let result of results.testResults) {
    if (result.message) {
      output += formatMessage(result.message) + '\n';
      output += `${FAIL} ${path.relative(__dirname, result.name)}\n`;
    } else {
      output += `${PASS} ${path.relative(__dirname, result.name)}\n`;
    }
    if (result.summary) {
      output += result.summary + '\n';
    }
  }

  const start = results.startTime;
  const end = results.testResults.reduce((current, result) => Math.max(current, result.endTime), start);
  const time = chalk.grey(`in ${end - start} ms`);

  if (results.numFailedTests) {
    const failureMsg = chalk.red(`${results.numFailedTests} test${results.numFailedTests == 1 ? '' : 's'} failed`);
    output += `${failureMsg} ${passMsg} ${time}`;
    output += '\n\n' + chalk.bgYellow.black(' Run "npm test" in a new terminal to enter interactive Jest mode ');
  } else {
    output += `${passMsg} ${time}`;
  }

  return output;
}

function formatMessage(message) {
  return message
    /* Highlight first line in red */
    .replace(/^.+/, match => chalk.red(match))

    /* Highlight file link */
    .replace(/(at\s.*\()(.*)(:\d+:\d+)([\s)])/gm, (match, p1, p2, p3, p4) => {
      return `${p1}${chalk.blue(p2)}${p3}${p4}`;
    });
}

module.exports = formatter;