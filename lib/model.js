/*
 * Xylem Model.
 *
 * A model object holds object instance data and data manipulation methods.
 */

var util = require('util');
var extend = require('extend');
var utils = require('./utils');
var Schema = require('./schema');

/**
 * Model constructor.
 *
 * @constructor
 * @param {Object} connection A connection or adapter instance.
 * @param {Object} settings The settings object.
 * @param {Object} values Initial object values.
 */
function Model(connection, settings, values) {
  Model.defineHiddenProperty(this, 'connection', connection);
  Model.defineHiddenProperty(this, 'settings', settings);

  // Set default values.
  if (settings.defaultValues) {
    if (typeof settings.defaultValues == 'function') {
      settings.defaultValues.call(this, values);
    }
    else {
      extend(this, settings.defaultValues);
    }
  }

  if (values) {
    extend(this, values);
  }

  // Add methods from settings.
  if (settings.methods) {
    for (var method in settings.methods) {
      Model.defineHiddenProperty(this, method, settings.methods[method]);
    }
  }

  Model.defineHiddenProperty(this, 'schema', new Schema(settings));
};

/**
 * Save this item.
 *
 * @param {Function} callback Function to run when data is saved.
 */
Model.prototype.save = function(callback) {
  var errors = this.schema.check(this);
  if (errors.length > 0) {
    return callback(new Error(errors.join("\n")));
  }

  Model.do(this.connection, this.settings, 'save', this, callback);
};

/**
 * Destroy this item.
 *
 * @param {Function} callback Function to run when data is destroyd.
 */
Model.prototype.destroy = function(callback) {
  Model.do(this.connection, this.settings, 'destroy', this[this.settings.key], callback);
};

/**
 * Execute model operations.
 *
 * @param {connection} connection A connection or adapter instance.
 * @param {Object} settings The settings object.
 * @param {String} operation Operation being performed, in this case also the
 *   event being emitted.
 * @param {Mixed} parameter A single parameter to pass to the operation
 *   callback.
 * @param {Function} callback Function to run when the operation completes.
 */
Model.do = function(connection, settings, operation, parameter, callback) {
  // Run all pre operation hooks.
  Model.invokeAndCall(connection, settings, 'before' + utils.capitalizeFirstLetter(operation), parameter, function(error, data) {
    if (error) {
      return callback(error);
    }

    // Run operation on the connection.
    connection[operation](settings, data, function(error, data) {
      if (error) {
        return callback(error);
      }

      // Run all operation hooks.
      Model.invokeAndCall(connection, settings, operation, data, function(error, data) {
        if (error) {
          return callback(error);
        }

        // Run all post operation hooks.
        Model.invokeAndCall(connection, settings, 'after' + utils.capitalizeFirstLetter(operation), data, callback);
      });
    });
  });
};

/**
 * Define hidden property so this doesn't appear in loops.
 *
 * @param {Object} object Object to add the property to.
 * @param {String} property Property name.
 * @param {Mixed} value Property value.
 */
Model.defineHiddenProperty = function(object, property, value) {
  Object.defineProperty(object, property, {
    writable: true,
    enumerable: false,
    configurable: true,
    value: value
  });
};

/**
 * Helper function that invoke callbacks for the requested operation and call a
 * resulting callback passing the data returned.
 *
 * @param {connection} connection A connection or adapter instance.
 * @param {Object} settings The settings object.
 * @param {String} operation Operation being performed, in this case also the
 *   event being emitted.
 * @param {Object} data Data object, usually a object representing single or
 *   multiple items.
 * @param {Function} callback Function to run when the operation completes.
*/
Model.invokeAndCall = function(connection, settings, operation, data, callback) {
  // Invoke operation hook on all extensions.
  this.invoke(operation, settings, data, function(error, result) {
    if (error) {
      if (callback) {
        return callback(error);
      }
      else {
        throw error;
      }
    }

    if (callback) {
      callback(null, data);
    }
  })
};

/**
 * Invoke a lifecycle callback on the model itself.
 *
 * @param {String} operation Lifecycle operation being performed.
 * @param {Object} settings Model settings object.
 * @param {Object} data Data object, usually a object representing single or
 *   multiple items.
 * @param {Function} callback Function to run when the operation completes.
*/
Model.invoke = function(operation, settings, data, callback) {
  if (operation in settings) {
    return settings[operation](settings, data, callback);
  }

  callback();
};

/**
 * Compile and return a new model class for a model.
 *
 * @param {Xylem} connection Xylem connection instance.
 * @param {Object} settings The settings object.
 * @return {Function} Actually a subclass of Model, a new class object for a model.
 */
Model.compile = function(connection, settings) {
  // We create a new class to return it.
  function MockModel(values) {
    // Create and return an instance if function is called without the 'new'
    // keyword.
    if (!(this instanceof MockModel)) {
      return new MockModel(values);
    }

    Model.call(this, connection, settings, values);
  };

  // Extends Model class.
  util.inherits(MockModel, Model);

  // Add a static variables for connection and settings.
  MockModel.connection = connection;
  MockModel.settings = settings;

  // Model static methods.
  MockModel.list = function(criteria, callback) {
    var normalizedCriteira = Model.normalizeCriteria(settings, criteria);
    Model.do(connection, settings, 'list', normalizedCriteira, callback);
  };

  MockModel.get = function(criteria, callback) {
    var normalizedCriteira = Model.normalizeCriteria(settings, criteria);
    Model.do(connection, settings, 'get', normalizedCriteira, callback);
  };

  MockModel.save = function(item, callback) {
    if (!(item instanceof this)) {
      // If item isn't an instance of its model, make it one.
      var item = new this(item);
    }
    Model.do(connection, settings, 'save', item, callback);
  };

  MockModel.destroy = function(criteria, callback) {
    var normalizedCriteira = Model.normalizeCriteria(settings, criteria);

    this.list(normalizedCriteira, function(error, items) {
      if (error) {
        return callback(error);
      }

      items.forEach(function(item) {
        extend(item, values);
        item.destroy(callback);
      });
    });
  };

  // Add static methods from settings.
  if (settings.statics) {
    extend(MockModel, settings.statics);
  }

  return MockModel;
};

/**
 * Normalize criteria argument.
 *
 * @param {Mixed} criteria A criteria scalar value (key) or a criteria object.
 * @param {Object} settings Model settings object.
 * @return {Object} Normalized criteria object.
 */
Model.normalizeCriteria = function(settings, criteria) {
  if (typeof criteria !== 'object') {
    var normalizedCriteira = {};
    normalizedCriteira[settings.key] = criteria

    return normalizedCriteira;
  }

  return settings.criteria;
};

module.exports = Model;
