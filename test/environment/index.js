// Standard packages
const path = require('path')

// Third-party packages
const dayjs = require('dayjs')
const { DockerComposeEnvironment, Wait } = require('testcontainers')

// zentity-ui packages
const config = require('../config.js')

/**
 * Singleton environment shared by ./setup.js and ./teardown.js.
 * Jest executes environment.setup() for globalSetup and environment.teardown()
 * for globalTeardown.
 *
 * Note: This is not accessible from test suites. Those are sandboxed by jest.
 * Instead, required variables such as the container's mapped ports are passed
 * using environment variables (process.env), which are accessible to the
 * test suites.
 */
const environment = {
  cluster: null,
}

/**
 * Setup the test cluster and the zentity-ui server.
 */
const setup = async () => {
  // Persist the start time for the screenshots directory
  process.env.TEST_START_TIME = dayjs().format('YYYY-MM-DDTHH-mm-ss')

  // Start the test cluster with docker-compose.yml
  console.log('\n')
  console.log('Starting test cluster...')
  environment.cluster = await new DockerComposeEnvironment(
    config.get('DOCKER_COMPOSE_FILEPATH'),
    config.get('DOCKER_COMPOSE_FILENAME')
  )
    .withEnv('ELASTICSEARCH_VERSION', config.get('ELASTICSEARCH_VERSION'))
    .withEnv('ZENTITY_VERSION', config.get('ZENTITY_VERSION'))
    .withStartupTimeout(config.get('DOCKER_COMPOSE_TIMEOUT'))
    .withWaitStrategy('es', Wait.forLogMessage(/mode \[basic\] \- valid/))
    .withWaitStrategy('zentity-ui', Wait.forLogMessage(/zentity\-ui started/))
    .up()

  // Persist the host names and mapped ports of the containers
  // as environment variables so that the test suites can use them.
  process.env.ELASTICSEARCH_CONTAINER_HOST = environment.cluster.getContainer('es').getHost()
  process.env.ELASTICSEARCH_CONTAINER_PORT = environment.cluster.getContainer('es').getMappedPort(9600)
  process.env.ZENTITY_UI_CONTAINER_HOST = environment.cluster.getContainer('zentity-ui').getHost()
  process.env.ZENTITY_UI_CONTAINER_PORT = environment.cluster.getContainer('zentity-ui').getMappedPort(2448)

  console.log(
    `- Elasticsearch running on: ${process.env.ELASTICSEARCH_CONTAINER_HOST}:${process.env.ELASTICSEARCH_CONTAINER_PORT}`
  )
  console.log(
    `- zentity-ui running on:    ${process.env.ZENTITY_UI_CONTAINER_HOST}:${process.env.ZENTITY_UI_CONTAINER_PORT}`
  )
}

/**
 * Stop the test cluster and the zentity-ui server.
 */
const teardown = async () => {
  // Remove environment variables.
  delete process.env.ELASTICSEARCH_CONTAINER_HOST
  delete process.env.ELASTICSEARCH_CONTAINER_PORT
  delete process.env.ZENTITY_UI_CONTAINER_HOST
  delete process.env.ZENTITY_UI_CONTAINER_PORT

  // Stop test clusters.
  console.log('\n')
  console.log('Stopping test cluster...')
  await environment.cluster.down({
    removeVolumes: true,
  })
}

module.exports = {
  setup: setup,
  teardown: teardown,
}
