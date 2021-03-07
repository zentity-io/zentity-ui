import axios from 'axios';

const ZENTITY_PROXY_ENDPOINT = "/es"; // scheme, host, and port inferred from URL
const TARGET_REQUEST_DELAY = 500;

/**
 * Sleep for some number of milliseconds.
 */
const sleep = function (milliseconds) {
  return new Promise(function(resolve) {
    setTimeout(resolve, milliseconds);
  });
};

/**
 * Generate a random number of milliseconds within 50% of a given target.
 */
const randomMillis = function(target) {
  const max = target * 1.5;
  const min = target * 0.5;
  return Math.random() * (max - min) + min;
};

/**
 * Track the start time of each request.
 */
axios.interceptors.request.use(async function (config) {
  config.startTime = new Date().getTime();
  return config;
}, function (error) {
  return Promise.reject(error);
});

/**
 * Ensure a proper delay for each request and then process the response data.
 */
axios.interceptors.response.use(async function (response) {

  // Ensure the each request has some noticable latency as feedback to the user.
  // If the elapsed time between now and the given startTime is less than that
  // target amount, impose a delay for the remaining difference.
  const timeElapsed = new Date().getTime() - response.config.startTime;
  const timeRemaining = randomMillis(TARGET_REQUEST_DELAY) - timeElapsed;
  if (timeElapsed > 0)
    await sleep(timeRemaining);

  // Keep both the raw body and parsed data for all responses.
  response.body = response.data;
  response.data = response.data ? JSON.parse(response.data) : undefined;
  return response;

}, async function (error) {

  // Ensure the each request has some noticable latency as feedback to the user.
  // If the elapsed time between now and the given startTime is less than that
  // target amount, impose a delay for the remaining difference.
  const timeElapsed = new Date().getTime() - error.config.startTime;
  const timeRemaining = randomMillis(TARGET_REQUEST_DELAY) - timeElapsed;
  if (timeElapsed > 0)
    await sleep(timeRemaining);

  // Keep both the raw body and parsed data for all responses.
  try {
    error.response.body = error.response.data;
    error.response.data = error.response.data ? JSON.parse(error.response.data) : undefined;
  } catch (e) {
    console.error(e);
  }
  return Promise.reject(error);
});

/**
 * Submit a request to the zentity-ui server.
 * Impose a brief random delay to provide feedback to the user.
 */
const request = function(path, opts) {
  opts = opts || {};
  return axios.request({
    method: opts.method,
    url: ZENTITY_PROXY_ENDPOINT + path,
    params: opts.params,
    headers: opts.headers || {},
    data: opts.data,
    timeout: 60000, // TODO: Make configurable
    transformResponse: (res) => {
      // Disable JSON parsing to return the exact response from Elasticsearch
      return res;
    }
  });
};

const del = function(path, opts) {
  opts = opts || {};
  opts.method = 'DELETE';
  return request(path, opts);
};

const get = function(path, opts) {
  opts = opts || {};
  opts.method = 'GET';
  return request(path, opts);
};

const post = function(path, opts) {
  opts = opts || {};
  opts.method = 'POST';
  return request(path, opts);
};

const put = function(path, opts) {
  opts = opts || {};
  opts.method = 'PUT';
  return request(path, opts);
};

exports.request = request;
exports.del = del;
exports.get = get;
exports.post = post;
exports.put = put;
