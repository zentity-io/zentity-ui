// Standard packages
const path = require("path");

// Third-party packages
const { DockerComposeEnvironment, Wait } = require("testcontainers");

/**
 * Singleton environment shared by ./setup.js and ./teardown.js.
 * Jest executes environment.setup() for globalSetup and environment.teardown()
 * for globalTeardown.
 */
const environment = {
  cluster: null,
  composeFilePath: path.resolve(__dirname, "..", "resources"),
  composeFile: "docker-compose.yml",
  timeout: 2 * 60 * 1000,
  versionElasticsearch: "7.10.2",
  versionZentity: "1.6.2",
};

/**
 * Setup the test cluster.
 */
const setup = async () => {
  console.log('\n');
  console.log('Starting test cluster...');
  environment.cluster = await new DockerComposeEnvironment(environment.composeFilePath, environment.composeFile)
    .withEnv("ELASTICSEARCH_VERSION", environment.versionElasticsearch)
    .withEnv("ZENTITY_VERSION", environment.versionZentity)
    .withStartupTimeout(environment.timeout)
    .withWaitStrategy("es01", Wait.forLogMessage(/mode \[basic\] \- valid/))
    .up();
};

/**
 * Stop the test cluster.
 */
const teardown = async () => {
  console.log('\n');
  console.log('Stopping test cluster...');
  await environment.cluster.down({
    removeVolumes: true
  });
};

module.exports = {
  setup: setup,
  teardown: teardown
};
