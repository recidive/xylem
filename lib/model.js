/*
 * Xylem Model.
 *
 * A model object holds object instance data and data manipulation methods.
 */

var util = require('util');
var extend = require('extend');
var async = require('async');
var utils = require('./utils');
var Schema = require('./schema');
var Query = require('./query');

/**
 * Model constructor.
 *
 * @constructor
 * @param {Object} server Xylem server instance.
 * @param {Object} settings The settings object.
 * @param {Object} values Initial object values.
 */
function Model(server, settings, values) {
  var connection = server.connection(settings.connection);

  if (!connection) {
    return server.error('Unknown connection ' + settings.connection + '.');
  }

  Model.defineHiddenProperty(this, 'server', server);
  Model.defineHiddenProperty(this, 'connection', connection);
  Model.defineHiddenProperty(this, 'settings', settings);
  Model.defineHiddenProperty(this, 'schema', new Schema(settings));
  Model.defineHiddenProperty(this, 'new', true);

  // Set default values.
  if (settings.defaultValues) {
    if (typeof settings.defaultValues == 'function') {
      settings.defaultValues.call(this, values);
    }
    else {
      extend(this, settings.defaultValues);
    }
  }

  // Add methods from settings.
  if (settings.methods) {
    for (var method in settings.methods) {
      Model.defineHiddenProperty(this, method, settings.methods[method]);
    }
  }

  if (settings.fields) {
    for (var fieldName in settings.fields) {
      var fieldSettings = settings.fields[fieldName];
      if (fieldSettings.type == 'reference') {
        // Add setters for reference fields.
        var self = this;
        Model.defineSetter(this, fieldName, function(value) {
          // At this point the value is validated so they are checked to be
          // an array or an object depending on whether it's multiple or not.
          if (fieldSettings.multiple) {
            self[fieldName] = [];
            value[fieldName].forEach(function(item, index) {
              self[fieldName][index] = new self.server.model(fieldSettings.reference)(item);
            });
          }
          else {
            self[fieldName] = new self.server.model(fieldSettings.reference)(value);
          }
        });
      }
    }

    // Hydrate values.
    if (values) {
      extend(this, values);
    }

    // Add instance methods.
    for (var fieldName in settings.methods) {
      Model.defineHiddenProperty(this, method, settings.methods[method]);
    }
  }

};

/**
 * Fill out model instance with values.
 *
 * @param {Object} values Values to set.
 * @param {Boolean} isNew Whether the object is new or loaded from the database.
 */
Model.prototype.hydrate = function(values, isNew) {
  extend(this, values);
  this.new = isNew === false ? false : true;
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

  var self = this;
  Model.do(this.connection, this.settings, 'save', this.toObject(), function(error, item) {
    if (error) {
      return callback(error);
    }

    extend(self, item);
    callback(null, self);
  });
};

/**
 * Return a clean object with only model fields and their values.
 *
 * @return {Object} Clean data object.
 */
Model.prototype.toObject = function() {
  var data = {};
  for (var fieldName in this.settings.fields) {
    var fieldSettings = this.settings.fields[fieldName];
    if (fieldSettings.type == 'reference') {
      if (!fieldSettings.multiple) {
        data[fieldName] = this[fieldName].toObject();
      }
      else {
        data[fieldName] = [];
        this[fieldName].forEach(function(item, index) {
          data[fieldName][index] = item.toObject();
        });
      }
    }
    else if (fieldName in this) {
      data[fieldName] = this[fieldName];
    }
  }
  return data;
};

/**
 * Destroy this item.
 *
 * @param {Function} callback Function to run when data is destroyd.
 */
Model.prototype.destroy = function(callback) {
  Model.do(this.connection, this.settings, 'destroy', this, callback);
};

/**
 * Execute model operations.
 *
 * @param {connection} connection A connection or adapter instance.
 * @param {Object} settings The settings object.
 * @param {String} operation Operation being performed, in this case also the
 *   event being emitted.
 * @param {Object|Array} parameter Parameter is usually an object representing a
 *   single item, a criteria or an array with multiple items.
 * @param {Function} callback Function to run when the operation completes.
 */
Model.do = function(connection, settings, operation, parameter, callback) {
  // Run before operation callback.
  Model.invoke(connection, settings, 'before' + utils.capitalizeFirstLetter(operation), parameter, function(error, result) {
    if (error) {
      return callback(error);
    }

    // Run operation on the connection.
    connection[operation](settings, result, function(error, result) {
      if (error) {
        return callback(error);
      }

      // Run after operation callback.
      Model.invoke(connection, settings, 'after' + utils.capitalizeFirstLetter(operation), result, callback);
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
 * Define setter for a given property.
 *
 * @param {Object} object Object to add the property to.
 * @param {String} property Property name.
 * @param {Function} setter The setter function which receives the incoming data
 *   and is responsible to store the data into the model object.
 */
Model.defineSetter = function(object, property, setter) {
  Object.defineProperty(object, property, {
    set: setter
  });
};

/**
 * Invoke a lifecylcle callback.
 *
 * @param {connection} connection A connection or adapter instance.
 * @param {Object} settings The settings object.
 * @param {String} operation Operation being performed.
 * @param {Object|Array} parameter Parameter is usually an object representing a
 *   single item, a criteria or an array with multiple items.
 * @param {Function} callback Function to run when the operation completes.
 */
Model.invoke = function(connection, settings, operation, parameter, callback) {
  if (!(operation in settings)) {
    return callback(null, parameter);
  }

  settings[operation].call(this, settings, parameter, function(error) {
    if (error) {
      throw error;
    }

    callback(null, parameter);
  })
};

/**
 * Compile and return a new model class for a model.
 *
 * @param {Object} server Xylem server instance.
 * @param {Object} settings The settings object.
 * @return {Function} Actually a subclass of Model, a new class object for a model.
 */
Model.compile = function(server, settings) {
  var connection = server.connection(settings.connection);

  if (!connection) {
    return server.error('Unknown connection ' + settings.connection + '.');
  }

  // We create a new class to return it.
  function MockModel(values) {
    // Create and return an instance if function is called without the 'new'
    // keyword.
    if (!(this instanceof MockModel)) {
      return new MockModel(values);
    }

    Model.call(this, server, settings, values);
  };

  // Extends Model class.
  util.inherits(MockModel, Model);

  // Model static methods.
  MockModel.list = function(criteria, callback) {
    // Allow callback to be the first argument when there's only one argument.
    if (!callback && criteria && typeof criteria === 'function') {
      callback = criteria;
      criteria = {};
    }

    // Create a query object if one wasn't passed in arguments.
    var query = criteria instanceof Query ? criteria : new Query(this, criteria);

    // If callback is set, execute it right way.
    if (callback) {
      var self = this;
      return Model.do(connection, settings, 'list', query, function(error, items) {
        if (error) {
          return callback(error);
        }

        var instances = [];
        items.forEach(function(item) {
          instances.push(new self(item));
        });
        callback(null, instances);
      });
    }

    // Otherwise return query object.
    return query;
  };

  MockModel.get = function(criteria, callback) {
    if (criteria instanceof Query) {
      var query = criteria;
    }
    else {
      var normalizedCriteria = Model.normalizeCriteria(settings, criteria);
      var query = new Query(this, normalizedCriteria);
    }

    var self = this;
    Model.do(connection, settings, 'get', query, function(error, item) {
      if (error) {
        return callback(error);
      }

      callback(null, item ? new self(item) : null);
    });
  };

  MockModel.create = function(item, callback) {
    if (!(item instanceof this)) {
      // If item isn't an instance of its model, make it one.
      var item = new this(item);
    }

    // If callback is supplied save item, otherwise just return the item to
    // be saved later.
    if (callback) {
      return item.save(callback);
    }

    return item;
  };

  MockModel.update = function(criteria, values, callback) {
    var normalizedCriteria = Model.normalizeCriteria(settings, criteria);

    this.list(normalizedCriteria, function(error, items) {
      if (error) {
        return callback(error);
      }

      async.each(items, function(item, next) {
        extend(item, values);
        item.save(next);
      },
      function(error) {
        callback(error, items);
      });
    });
  };

  MockModel.destroy = function(criteria, callback) {
    var normalizedCriteria = Model.normalizeCriteria(settings, criteria);

    this.list(normalizedCriteria, function(error, items) {
      if (error) {
        return callback(error);
      }

      async.each(items, function(item, next) {
        item.destroy(next);
      },
      function(error) {
        callback(error, items);
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
 * @param {Object} settings Model settings object.
 * @param {Mixed} criteria A criteria scalar value (key) or a criteria object.
 * @return {Object} Normalized criteria object.
 */
Model.normalizeCriteria = function(settings, criteria) {
  if (typeof criteria !== 'object') {
    var normalizedCriteria = {};
    normalizedCriteria[settings.key] = criteria;

    return normalizedCriteria;
  }

  return criteria;
};

module.exports = Model;
