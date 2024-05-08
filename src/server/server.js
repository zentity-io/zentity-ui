// Standard packages
import { globalAgent, createServer } from 'https'
import { readFileSync } from 'fs'
import { join } from 'path'

// Third-party packages
import { request } from 'axios'
import { json } from 'body-parser'
import express from 'express'

// Configuration
import { get } from './config'

// Configure the agent that will communicate with Elasticsearch
if (get('elasticsearch.tls.verification')) {
  if (get('elasticsearch.tls.verification') === 'none') {
    globalAgent.options.rejectUnauthorized = false
  } else {
    globalAgent.options.rejectUnauthorized = true
    if (get('elasticsearch.tls.key')) globalAgent.options.pfx = readFileSync(get('elasticsearch.tls.key'))
    if (get('elasticsearch.tls.passphrase')) globalAgent.options.passphrase = get('elasticsearch.tls.passphrase')
  }
}

// Application
const app = express()
const statics = ['/', '/css*', '/fonts*', '/img*', '/js*']
app.use(statics, express.static(join(__dirname, '..', 'app')))
app.use((req, res, next) => {
  var rawBody = ''
  req.on('data', (chunk) => (rawBody += chunk))
  req.on('end', () => (req.rawBody = rawBody))
  next()
})
app.use(json())

/**
 * Send a request to Elasticsearch.
 */
const esRequest = (opts) => {
  const optsFinal = {
    method: opts.method,
    url: get('elasticsearch.url') + opts.path,
    params: opts.params,
    headers: opts.headers,
    data: opts.data,
    timeout: get('elasticsearch.timeout'),
    transformResponse: (res) => {
      // Disable JSON parsing to return the exact response from Elasticsearch
      return res
    },
  }
  if (get('elasticsearch.username') != null && get('elasticsearch.password') != null)
    optsFinal.auth = {
      username: get('elasticsearch.username'),
      password: get('elasticsearch.password'),
    }
  return request(optsFinal)
}

/**
 Proxy requests from the frontend application to Elasticsearch.
 */
app.all('/es*', (req, res) => {
  const opts = {
    method: req.method,
    path: req.params[0],
    params: req.query,
    headers: req.headers,
    data: req.headers['Content-Type'] === 'application/json' ? req.body : req.rawBody,
  }
  return esRequest(opts)
    .then((esResponse) => {
      // Return a response from Elasticsearch.
      res.status(esResponse.status).header('Content-Type', 'application/json').send(esResponse.data)
    })
    .catch((error) => {
      console.error(error)
      try {
        // Return an error from Elasticsearch.
        res.status(error.response.status).header('Content-Type', 'application/json').send({
          error: error.response.statusText,
          message: error.response.data,
        })
      } catch (e) {
        // Return an error not from Elasticsearch.
        let title = 'Server error'
        let message = 'Something unexpected happened. Check the zentity-ui server logs for details.'
        try {
          let header = error.name || 'Unknown error'
          if (error.code) header = header + ': ' + error.code
          message =
            'This error occurred when the zentity-ui server sent a request to Elasticsearch:\n\n' +
            header +
            '\n' +
            error.message
        } catch (e) {
          console.warn('Error when creating error message:')
          console.error(e)
        } finally {
          res.status(500).header('Content-Type', 'text/plain').send({
            error: title,
            message: message,
          })
        }
      }
    })
})

/**
 * Serve the frontend application.
 */
app.get('/', (req, res) => res.sendFile(join(__dirname, '..', 'app', 'index.html')))

/**
 * Start the application server.
 */
const confirmation = () => {
  const scheme = get('zentity-ui.tls.enabled') ? 'https' : 'http'
  const host = get('zentity-ui.host')
  const port = get('zentity-ui.port')
  console.log(`zentity-ui started on ${scheme}://${host}:${port}`)
}
if (!get('zentity-ui.tls.enabled')) {
  // ...with TLS disabled.
  app.listen(get('zentity-ui.port'), get('zentity-ui.host'), confirmation)
} else {
  // ...with TLS enabled.
  const tlsOptions = {
    pfx: readFileSync(get('zentity-ui.tls.key')),
    passphrase: get('zentity-ui.tls.passphrase'),
  }
  createServer(tlsOptions, app).listen(get('zentity-ui.port'), get('zentity-ui.host'), confirmation)
}
