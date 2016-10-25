const utils = require('../');

it('should export utils', () => {
  expect(utils.plugins).toBeDefined();
  expect(utils.utils).toBeDefined();
  expect(utils.tasks).toBeDefined();
})