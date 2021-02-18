// Standard packages
const fs = require("fs");
const path = require("path");

// Third-party packages
const axios = require("axios");
const dayjs = require("dayjs");

// zentity packages
const config = require("./config.js");
const environment = require("./environment");

// Return the contents of a file from the ./resources directory
const loadResource = (filename) => fs.readFileSync(path.join(__dirname, "resources", filename), 'utf8');

// Log an error message returned by Elasticsearch
const logAxiosError = (error, message) => {
  console.log(message + ': ' + error.response.status + ' ' + error.response.statusText);
  console.log(error.response.data);
};

const setupIndex = async () => {
  await axios({
    method: 'put',
    url: config.get('URL_CLUSTER') + '/zentity_tutorial_4_multiple_resolver_resolution',
    data: JSON.parse(loadResource('test-index.json'))
  }).catch((error) => logAxiosError(error, 'Error when creating test index'));
};

const setupModel = async () => {
  await axios({
    method: 'post',
    url: config.get('URL_CLUSTER') + '/_zentity/models/zentity_tutorial_4_person',
    data: JSON.parse(loadResource('test-model.json'))
  }).catch((error) => logAxiosError(error, 'Error when creating test entity model'));
};

const setupData = async () => {
  await axios({
    method: 'post',
    url: config.get('URL_CLUSTER') + '/_bulk',
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
    url: config.get('URL_CLUSTER') + '/zentity_tutorial_4_multiple_resolver_resolution'
  }).catch((error) => {
    if (error.response.status !== 404)
      logAxiosError(error, 'Error when deleting test index');
  });
};

const teardownModel = async () => {
  await axios({
    method: 'delete',
    url: config.get('URL_CLUSTER') + '/_zentity/models/zentity_tutorial_4_person'
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

const screenshot = async (page) => {
  const element = await page.$('body');
  const timestamp = dayjs().format('YYYY-MM-DDTHH-mm-ss');
  const testname = expect.getState().currentTestName.toLowerCase().replace(/ /g,'-').replace(/[^\w-]+/g,'');
  const filename = timestamp + '-' + testname + '.png';
  await element.screenshot({ path: path.join(__dirname, 'screenshots', filename) });
};

module.exports = {
  screenshot: screenshot,
  setup: setup,
  teardown: teardown
};
