// Standard packages
const fs = require('fs');
const path = require('path');
const process = require('process');

// Third-party packages
const parseArgs = require('minimist');
const yaml = require('js-yaml');

// Default configuration.
// Field names that start with '_' are not derived from the config file.
const config = {
  '_config.file': './zentity-ui.yml',
  'elasticsearch.url': 'https://localhost:9200',
  'elasticsearch.tls.verification': 'full',
  'elasticsearch.tls.key': '',
  'elasticsearch.tls.passphrase': '',
  'elasticsearch.username': null,
  'elasticsearch.password': null,
  'elasticsearch.timeout': 10000,
  'zentity-ui.host': 'localhost',
  'zentity-ui.port': 2048,
  'zentity-ui.tls.enabled': false,
  'zentity-ui.tls.key': '',
  'zentity-ui.tls.passphrase': '',
};

// Parse command-line arguments
const args = parseArgs(process.argv.slice(2));
if (args) {
  for (var key in args) {
    switch (key) {
      case 'c':
        config['_config.file'] = args[key];
        break;
    }
  }
}

// Get config file
var configFile;
try {
  configFile = fs.readFileSync(config['_config.file'], 'utf8');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.error('No configuration file at specified path: ' + config['_config.file']);
    process.exit(1);
  } else {
    throw err;
  }
}

const isTrue = function (value) {
  return value === true || String(value).trim() === 'true';
};

const isFalse = function(value) {
  return value === false || String(value).trim() === 'false';
};

const isNull = function(value) {
  return value === undefined || value === null || String(value).trim() === 'null' || String(value).trim() === '';
};

const parseBoolean = function(value) {
  switch (value) {
    case true:
    case 'true':
      return true;
    case false:
    case 'false':
      return false;
    default:
      throw new Error(`Expected "true" or "false" but received: ${value}`);
  }
};

// Parse config file
const configYaml = yaml.load(configFile || {});
if (configYaml) {

  // Only parse keys that exist in the default configuration
  // and don't start with '_'.
  for (var key in config) {
    if (key.startsWith('_'))
      continue;
    if (key in configYaml) {
      const value = configYaml[key];
      switch (key) {

        // Values that must be integers
        case 'elasticsearch.timeout':
        case 'zentity-ui.port':
          config[key] = parseInt(value);
          break;

        // Values that must be booleans
        case 'elasticsearch.tls.enabled':
        case 'zentity-ui.tls.enabled':
          try {
            config[key] = parseBoolean(value);
          } catch (e) {
            throw new Error(`${key} must be "true" or "false". You gave: ${value}`);
          }
          break;

        // Values that must be paths
        case 'elasticsearch.tls.key':
        case 'zentity-ui.tls.key':
          if (!isNull(value)) {
            if (!path.isAbsolute(value))
              config[key] = path.join(__dirname, value);
            else
              config[key] = value;
          }
          break;

        // Values with specific options
        case 'elasticsearch.tls.verification':
          switch (value) {
            case 'full':
            case 'certificate':
            case 'none':
              config[key] = value;
              break;
            default:
              throw new Error(`${key} must be "full", "certificate", or "none". You gave: ${value}`);
          }
          break;

        // Accept everything else as-is
        default:
          config[key] = value;
          break;
      }
    }
  }
}

const get = function(key) {
  return config[key];
};

exports.get = get;
