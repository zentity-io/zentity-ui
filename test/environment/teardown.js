const environment = require('.');

module.exports = async () => {
  await environment.teardown();
};
