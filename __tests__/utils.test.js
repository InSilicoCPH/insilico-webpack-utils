const utils = require('../');

it('should export utils', () => {
  expect(utils.devTerminal).toBeDefined();
  expect(utils.errorHandler).toBeDefined();
  expect(utils.status).toBeDefined();
});