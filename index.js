'use strict'

const url = require('url');
const async = require('async');
const Model = require('./lib/model');

/**
 * Xylem server.
 */
class Server {

  /**
   * Xylem server.
   *
   * @constructor
   */
  constructor() {
    this.adapters = {};

    // Connections are adapter instances.
    this.connections = {};
    this.models = {};

    this.initialized = false;
  }

  /**
   * Initialize all connections.
   *
   * @param {Function} callback Callback to run when sucessfull initialized.
   */
  init(callback) {
    let self = this;
    async.each(Object.keys(this.connections), function(connName, next) {
      let connection = self.connections[connName];
      connection.init(next);
    },
    function(error) {
      if (error) {
        return callback(error);
      }

      self.initialized = true;
      callback();
    });
  }

  /**
   * Add or get an adapter.
   *
   * @param {String} name Adapter name.
   * @param {Object} [constructor] Adapter constructor.
   * @return {Function|Server} Adapter constructor if constructor argument is
   *   omitted or the Server instance itself so method calls can be chained.
   */
  adapter(name, constructor) {
    if (!constructor) {
      return this.adapters[name];
    }

    this.adapters[name] = constructor;

    return this;
  }

  /**
   * Add or get a connection.
   *
   * @param {String} name Connection name.
   * @param {String} url Connection settings URL.
   * @return {Adapter|Server} Adapter instance (connection) if url argument is
   *   omitted or the Server instance itself so method calls can be chained.
   */
  connection(name, url) {
    if (!url) {
      return this.connections[name];
    }

    const settings = this.parseSettingsURL(url);

    if (!(settings.adapter in this.adapters)) {
      return this.error('Unknown adapter ' + settings.adapter + '.');
    }

    let adapter = this.adapters[settings.adapter];
    let connection = new adapter(settings);

    this.connections[name] = connection;

    return this;
  }

  /**
   * Add or get a model.
   *
   * @param {String} name Model name.
   * @param {Object} settings Model settings object.
   * @return {Function|Server} Model constructor if settings argument is omitted
   *   or the Server instance itself so method calls can be chained.
   */
  model(name, settings) {
    if (!settings) {
      return this.models[name];
    }

    // Add name to model settings.
    settings.name = name;

    this.models[name] = Model.compile(this, settings);

    return this;
  }

  /**
   * Parse settings URL into setting object.
   *
   * @param {String} settingsURL Connection settings URL.
   * @return {Object} Settings object.
   */
  parseSettingsURL(settingsURL) {
    const urlInfo = url.parse(settingsURL);
    const settingsMap = {
      adapter: 'protocol',
      hostname: 'hostname',
      port: 'port',
      database: 'pathname'
    };

    let settings = {};

    for (let setting in settingsMap) {
      let property = settingsMap[setting];
      let value = urlInfo[property];

      if (property == 'protocol') {
        // Remove colon from protocol.
        value = value.substring(0, value.length - 1);
      }

      if (property == 'pathname') {
        // Remove slash from pathname.
        value = value.substring(1, value.length);
      }

      if (property in urlInfo) {
        settings[setting] = value;
      }
    }

    return settings;
  }

  /**
   * Throw an error.
   *
   * @param {String} message Error message.
   */
  error(message) {
    throw new Error(message);
  }

}

module.exports = Server;
