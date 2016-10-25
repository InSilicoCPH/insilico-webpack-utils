const yarnSupport = require('../yarn-support');
jest.mock('child_process', () => {
  return {
    exec: (cmd, cb) => cb(null, '0.16.1'),
  }
});


it('should get yarn version', () => {
  return yarnSupport()
    .then(support => expect(support).toEqual('0.16.1'))
})