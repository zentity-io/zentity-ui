// Standard packages
const fs = require("fs");
const path = require("path");

// Third-party packages
const axios = require("axios");

// Return the contents of a file from the ./resources directory
const loadResource = (filename) => fs.readFileSync(path.join(__dirname, "resources", filename), 'utf8');

// Log an error message returned by Elasticsearch
const logAxiosError = (error, message) => {
  try {
    console.log(message + ': ' + error.response.status + ' ' + error.response.statusText);
    console.log(error.response.data);
  } catch (e) {
    console.log(message + ':');
    console.log(error);
  }
};

const setupIndex = async () => {
  await axios({
    method: 'put',
    url: urlEs('/zentity_tutorial_4_multiple_resolver_resolution'),
    data: JSON.parse(loadResource('test-index.json'))
  }).catch((error) => logAxiosError(error, 'Error when creating test index'));
};

const setupModel = async () => {
  await axios({
    method: 'post',
    url: urlEs('/_zentity/models/zentity_tutorial_4_person'),
    data: JSON.parse(loadResource('test-model.json'))
  }).catch((error) => logAxiosError(error, 'Error when creating test entity model'));
};

const setupData = async () => {
  await axios({
    method: 'post',
    url: urlEs('/_bulk'),
    headers: {
      'Content-Type': 'application/x-ndjson'
    },
    params: {
      refresh: 'true'
    },
    data: loadResource('test-data.ndjson')
  }).catch((error) => logAxiosError(error, 'Error when creating test data'));
};

const teardownIndex = async () => {
  await axios({
    method: 'delete',
    url: urlEs('/zentity_tutorial_4_multiple_resolver_resolution')
  }).catch((error) => {
    if (error.response.status !== 404)
      logAxiosError(error, 'Error when deleting test index');
  });
};

const teardownModel = async () => {
  await axios({
    method: 'delete',
    url: urlEs('/_zentity/models/zentity_tutorial_4_person')
  }).catch((error) => {
    if (error.response.status !== 404)
      logAxiosError(error, 'Error when deleting test entity model');
  });
};

const setup = async () => {
  await setupIndex();
  await setupData();
  await setupModel();
};

const teardown = async () => {
  await teardownModel();
  await teardownIndex();
};

/**
 * Save a screenshot of a given page.
 */
const screenshot = async (page, browserName) => {
  const element = await page.$(':root');
  const timestamp = process.env.TEST_START_TIME;
  const testname = expect.getState().currentTestName.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
  const filename = `${browserName}-${testname}.png`;
  await element.screenshot({ path: path.join(__dirname, 'screenshots', timestamp, filename) });
};

/**
 * Build a URL to the zentity-ui container.
 * The environment variables will have been populated at global setup.
 */
const url = (urlPath) => {
  const host = process.env.ZENTITY_UI_CONTAINER_HOST;
  const port = process.env.ZENTITY_UI_CONTAINER_PORT;
  return `http://${host}:${port}${urlPath || '/'}`;
};

/**
 * Build a URL to the Elasticsearch container.
 * The environment variables will have been populated at global setup.
 */
const urlEs = (urlPath) => {
  const host = process.env.ELASTICSEARCH_CONTAINER_HOST;
  const port = process.env.ELASTICSEARCH_CONTAINER_PORT;
  return `http://${host}:${port}${urlPath || '/'}`;
};

module.exports = {
  screenshot: screenshot,
  setup: setup,
  setupData: setupData,
  setupIndex: setupIndex,
  setupModel: setupModel,
  teardown: teardown,
  teardownIndex: teardownIndex,
  teardownModel: teardownModel,
  url: url
};
