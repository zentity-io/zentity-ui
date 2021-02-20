// Standard packages
const path = require('path');

// Configuration used by the test cluster and test suites.
const config = {};
config.DOCKER_COMPOSE_FILEPATH = path.resolve(__dirname, "resources");
config.DOCKER_COMPOSE_FILENAME = 'docker-compose.yml';
config.DOCKER_COMPOSE_TIMEOUT = 2 * 60 * 1000; // 2 minutes
config.ELASTICSEARCH_VERSION = '7.10.2';
config.SLA = { timeout: 2 * 1000 }; // Time it should take for selectors to pass
config.ZENTITY_VERSION = '1.6.2'; // Version of zentity plugin for Elasticsearch

exports.get = (key) => config[key];
