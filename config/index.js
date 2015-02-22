/**
 * Load environment-specific config files (defaulting to 'development') and secrets
 */
'use strict';

var path = require('path'),
  nconf = require('nconf');

var configurationFiles = {
  development: path.join(__dirname, 'development.json'),
  production: path.join(__dirname, 'production.json')
};

var globalConfig  = configurationFiles[process.env.NODE_ENV] || configurationFiles.development,
    secretsConfig = path.join(__dirname, 'secrets.json');

/** config hierachy: environment variables -> config files */
nconf
  .env()
  .file('global', globalConfig)
  .file('secrets', secretsConfig);

/** load configuration files */
nconf.load();

module.exports = nconf;
