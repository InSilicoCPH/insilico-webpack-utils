const execa = require('execa');
const Listr = require('listr');
const argv = require('minimist')(process.argv.slice(2));

module.exports = function commit() {
  return execa.stdout('git', ['status', '--porcelain'])
    .then(status => status ? executeCommit() : null);
};

function executeCommit() {
  const commitMessage = argv.m || argv.message || 'Deploy';

  const tasks = new Listr([
    {
      title: 'Add all files',
      task: () => execa.stdout('git', ['add', '.']),
    },
    {
      title: 'Commit',
      task: () => execa.stdout('git', ['commit', '-a', '-m', `"${commitMessage}"`]),
    },
    {
      title: 'Pull with rebase',
      task: () => execa.stdout('git', ['pull', '--rebase'])
        .then(branch => currentBranch = branch),
    },
    {
      title: 'Push',
      task: () => execa.stdout('git', ['push'])
        .then(branch => currentBranch = branch),
    },
  ]);

  tasks.run().catch(err => {
    console.error(err);
  });

  return tasks;
}