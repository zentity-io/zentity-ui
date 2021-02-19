// Standard packages
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Third-party packages
const axios = require('axios');
const express = require('express');

// Configuration
const config = require("./config");

// Configure the agent that will communicate with Elasticsearch
if (config.get('elasticsearch.tls.verification')) {
  if (config.get('elasticsearch.tls.verification') === 'none') {
    https.globalAgent.options.rejectUnauthorized = false;
  } else {
    https.globalAgent.options.rejectUnauthorized = true;
    if (config.get('elasticsearch.tls.key'))
      https.globalAgent.options.pfx = fs.readFileSync(config.get('elasticsearch.tls.key'));
    if (config.get('elasticsearch.tls.passphrase'))
      https.globalAgent.options.passphrase = config.get('elasticsearch.tls.passphrase');
  }
}

// Application
const app = express();
const statics = [ "/", "/css*", "/fonts*", "/img*", "/js*" ];
app.use(statics, express.static(path.join(__dirname, "..", "app")));
app.use(express.json());

/**
 * Send a request to Elasticsearch.
 */
const esRequest = function(opts) {
  const optsFinal = {
    method: opts.method,
    url: config.get('elasticsearch.url') + opts.path,
    params: opts.params,
    data: opts.data,
    timeout: config.get('elasticsearch.timeout'),
    transformResponse: function(res) {
      // Disable JSON parsing to return the exact response from Elasticsearch
      return res;
    }
  };
  if (config.get('elasticsearch.username') != null && config.get('elasticsearch.password') != null)
    optsFinal.auth = {
      username: config.get('elasticsearch.username'),
      password: config.get('elasticsearch.password')
    };
  return axios.request(optsFinal);
};

/**
 Proxy requests from the frontend application to Elasticsearch.
 */
app.all("/es*", function(req, res) {
  const opts = {
    method: req.method,
    path: req.params[0],
    params: req.query,
    data: req.body
  };
  return esRequest(opts).then(function(esResponse) {
    // Return a response from Elasticsearch.
    res
      .status(esResponse.status)
      .header("Content-Type", "application/json")
      .send(esResponse.data);
  }).catch(function(error) {
    console.error(error);
    try {
      // Return an error from Elasticsearch.
      res
        .status(error.response.status)
        .header("Content-Type", "application/json")
        .send({
          error: error.response.statusText,
          message: error.response.data
        });
    } catch (e) {
      // Return an error not from Elasticsearch.
      let title = 'Server error';
      let message = 'Something unexpected happened. Check the zentity-ui server logs for details.';
      try {
        let header = error.name || 'Unknown error';
        if (error.code)
          header = header + ': ' + error.code;
        message = 'This error occurred when the zentity-ui server sent a request to Elasticsearch:\n\n' + header + '\n' + error.message;
      } catch (e) {
        console.warn('Error when creating error message:');
        console.error(e);
      } finally {
        res
          .status(500)
          .header("Content-Type", "text/plain")
          .send({
            error: title,
            message: message
          });
      }
    }
  });
});

/**
 * Serve the frontend application.
 */
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "..", "app", "index.html"));
});

/**
 * Start the application server.
 */
const confirmation = function () {
  const scheme = config.get('zentity-ui.tls.enabled') ? 'https' : 'http';
  const host = config.get('zentity-ui.host');
  const port = config.get('zentity-ui.port');
  console.log(`zentity-ui started on ${scheme}://${host}:${port}`);
}

/**
 * Start the application server.
 */
if (!config.get('zentity-ui.tls.enabled')) {

  // ...with TLS disabled.
  app.listen(config.get('zentity-ui.port'), config.get('zentity-ui.host'), confirmation);

} else {

  // ...with TLS enabled.
  const tlsOptions = {
    pfx: fs.readFileSync(config.get('zentity-ui.tls.key')),
    passphrase: config.get('zentity-ui.tls.passphrase')
  };
  https.createServer(tlsOptions, app).listen(config.get('zentity-ui.port'), config.get('zentity-ui.host'), confirmation);
}
