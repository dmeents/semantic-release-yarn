const { jest } = require("@dmeents/maestro");

module.exports = {
  ...jest({
    packageName: "semantic-release-yarn",
    tsconfig: "./tsconfig.json",
  }),
};
