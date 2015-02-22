var http = require('http');
var extend = require('extend');
var config = require('./config');

var host = config.get('fed_api_endpoint');
var key = config.get('fed_api_key');

var defaultOptions = {
  host: host,
  method: 'GET',
  headers: { 'Content-Type': 'application/json; charset=utf-8' }
};

function ApiService(basePath) {
  this.basePath = basePath || '';
}

ApiService.prototype.request = function(options) {
  if (typeof options === 'string') {
    options = { path: options };
  }

  // merge incoming options with the defaults
  options = extend({}, defaultOptions, options);

  // update the path to include the api key and basePath
  options.path = this.basePath + options.path + '?key=' + key;

  var args = [];
  Array.prototype.push.apply(args, arguments);

  // pop off first arg and add the options object
  args.shift();
  args.unshift(options);

  return http.get.apply(this, args);
};

module.exports = function(basePath) {
  return new ApiService(basePath);
};
