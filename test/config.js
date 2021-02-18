const config = {};
config.URL_CLUSTER = 'http://localhost:9200'; // URL to the test cluster created by ./environment/setup.js
config.URL_HOME = 'http://localhost:2048';
config.URL_EXPLORE = config.URL_HOME + '/#/explore';
config.URL_MODELS = config.URL_HOME + '/#/models';
config.SLA = { timeout: 2 * 1000 }; // Time it should take for a selector to pass

const get = function(key) {
  return config[key];
};

exports.get = get;
