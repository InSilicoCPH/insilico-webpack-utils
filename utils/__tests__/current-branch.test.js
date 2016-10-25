const currentBranch = require('../current-branch');
jest.mock('child_process', () => {
  return {
    exec: (cmd, cb) => cb(null, 'master'),
  }
});

it('should fetch current branch', () => {
  return currentBranch()
    .then(branch => expect(branch).toEqual('master'));
})