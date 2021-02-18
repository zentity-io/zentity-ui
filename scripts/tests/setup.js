const environment = require("./env.js");

module.exports = async () => {
  await environment.setup();
};
