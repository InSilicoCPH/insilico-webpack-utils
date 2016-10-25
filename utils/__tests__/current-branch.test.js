const currentBranch = require('../current-branch');

it('should fetch current branch', () => {
  return currentBranch()
    .then(branch => expect(typeof branch).toBe('string'));
})