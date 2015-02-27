/*
 * Xylem Storage.
 *
 * The storage is the main object to manipulate connections and models.
 */

var async = require('async');

/**
 * Storage constructor.
 *
 * @constructor
 */
function Storage() {
  // Connectons are adapters instances.
  this.connections = {};
  this.models = {};
  this.initialized = false;
};

/**
 * Add or get a connection.
 *
 * @param {String} name Connection name.
 * @param {Object} connection A connection or adapter instance.
 */
Storage.prototype.connection = function(name, connection) {
  return connection ? this.connections[name] = connection : this.connections[name];
};

/**
 * Add or get a model.
 *
 * @param {String} name Model name.
 * @param {Object} model A model constructor.
 */
Storage.prototype.model = function(name, model) {
  return model ? this.models[name] = model : this.models[name];
};

/**
 * Initialize all connections.
 *
 * @param {Function} callback Callback to run when sucessfull initialized.
 */
Storage.prototype.init = function(callback) {
  var self = this;
  async.each(Object.keys(this.connections), function(connName, next) {
    var connection = self.connections[connName];
    connection.init(next);
  },
  function() {
    self.initialized = true;
    callback();
  });
};

module.exports = Storage;
