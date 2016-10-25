const yarnSupport = require('../yarn-support');

it('should get yarn version', () => {
  return yarnSupport()
    .then(support => expect(typeof support).toBe('string'))
    .catch(support => expect(support).toBe(null));
})