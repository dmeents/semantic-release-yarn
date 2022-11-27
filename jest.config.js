const { jest } = require('@dmeents/maestro');

module.exports = {
  ...jest({
    packageName: 'semantic-release-yarn',
    isNode: true,
    tsconfig: 'tsconfig.json',
  }),
};
