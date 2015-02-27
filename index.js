var url = require('url');
var Storage = require('./lib/storage');
var Model = require('./lib/model');

/**
 * Xylem server constructor.
 *
 * @constructor
 */
function Server() {
  this.adapters = {};
  this.storage = new Storage();
};

/**
 * Initialize storage server.
 *
 * @param {Function} callback Function to run when server is initialized.
 *
 * @todo Maybe not needed since we can init storage on first use (query, etc).
 */
Server.prototype.init = function(callback) {
  this.storage.init(callback);
};

/**
 * Add an adapter.
 *
 * @param {String} name Adapter name.
 * @param {Object} constructor Adapter constructor.
 */
Server.prototype.adapter = function(name, constructor) {
  if (!constructor) {
    return this.adapters[name];
  }

  this.adapters[name] = constructor;

  return this;
};

/**
 * Add or get a connection.
 *
 * @param {String} name Connection name.
 * @param {String} url Connection settings URL.
 */
Server.prototype.connection = function(name, url) {
  if (!url) {
    return this.storage.connection(name);
  }

  var settings = this.parseSettingsURL(url);

  if (!(settings.adapter in this.adapters)) {
    return this.error('Unknown adapter ' + settings.adapter + '.');
  }

  var adapter = this.adapters[settings.adapter];
  var connection = new adapter(settings);

  this.storage.connection(name, connection);

  return this;
};

/**
 * Add or get a model.
 *
 * @param {String} name Model name.
 * @param {Object} settings Model settings object.
 */
Server.prototype.model = function(name, settings) {
  if (!settings) {
    return this.storage.model(name);
  }

  var connection = this.storage.connection(settings.connection);

  if (!connection) {
    return this.error('Unknown storage ' + settings.storage + '.');
  }

  this.storage.model(name, Model.compile(connection, settings));

  return this;
};

/**
 * Parse settings URL into setting object.
 *
 * @param {String} settingsURL Storage settings URL.
 * @return {Object} Settings object.
 */
Server.prototype.parseSettingsURL = function(settingsURL) {
  var settings = {};
  var urlInfo = url.parse(settingsURL);
  var settingsMap = {
    adapter: 'protocol',
    hostname: 'hostname',
    port: 'port',
    path: 'pathname'
  };

  for (var setting in settingsMap) {
    var property = settingsMap[setting];
    var value = urlInfo[property];

    if (property == 'protocol') {
      // Remove colon from protocol.
      value = value.substring(0, value.length - 1);
    }

    if (property in urlInfo) {
      settings[setting] = value;
    }
  }

  return settings;
};

/**
 * Throw an error.
 */
Server.prototype.error = function(message) {
  throw new Error(message);
};

module.exports = Server
