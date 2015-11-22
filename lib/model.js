'use strict'

const async = require('async');
const utils = require('./utils');
const Schema = require('./schema');
const Query = require('./query');

/**
 * Xylem Model.
 *
 * A model object holds object instance data and data manipulation methods.
 */
class Model {

  /**
   * Model constructor.
   *
   * @constructor
   * @param {Object} server Xylem server instance.
   * @param {Object} settings The settings object.
   * @param {Object} values Initial object values.
   */
  constructor (server, settings, values) {
    let connection = server.connection(settings.connection);

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
        Object.assign(this, settings.defaultValues);
      }
    }

    // Add methods from settings.
    if (settings.methods) {
      for (let method in settings.methods) {
        Model.defineHiddenProperty(this, method, settings.methods[method]);
      }
    }

    if (settings.fields) {
      const self = this;

      for (let fieldName in settings.fields) {
        let fieldSettings = settings.fields[fieldName];

        if (fieldSettings.type == 'reference') {
          // Add setters for reference fields.
          Model.defineSetter(this, fieldName, function(value) {
            console.log('setter value', value);
            console.log('setter self before', self);
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
            console.log('setter self after', self);
          });
        }
      }

      // Hydrate values.
      if (values) {
        Object.assign(this, values);
      }

      // Add instance methods.
      for (let methodName in settings.methods) {
        Model.defineHiddenProperty(this, methodName, settings.methods[methodName]);
      }
    }

  }

  /**
   * Fill out model instance with values.
   *
   * @param {Object} values Values to set.
   * @param {Boolean} isNew Whether the object is new or loaded from the database.
   */
  hydrate(values, isNew) {
    Object.assign(this, values);
    this.new = isNew === false ? false : true;
  }

  /**
   * Save this item.
   *
   * @param {Function} callback Function to run when data is saved.
   */

  save(callback) {
    let errors = this.schema.check(this);
    if (errors.length > 0) {
      return callback(new Error(errors.join('\n')));
    }

    const self = this;
    Model.do(this.connection, this.settings, 'save', this.toObject(), function(error, item) {
      if (error) {
        return callback(error);
      }

      Object.assign(self, item);
      callback(null, self);
    });
  }

  /**
   * Return a clean object with only model fields and their values.
   *
   * @return {Object} Clean data object.
   */
  toObject() {
    let data = {};
    for (let fieldName in this.settings.fields) {
      let fieldSettings = this.settings.fields[fieldName];
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
  }

  /**
   * Destroy this item.
   *
   * @param {Function} callback Function to run when data is destroyd.
   */
  destroy(callback) {
    Model.do(this.connection, this.settings, 'destroy', this, callback);
  }

  /**
   * Execute model operations.
   *
   * @param {connection} connection A connection or adapter instance.
   * @param {Object} settings The settings object.
   * @param {String} operation Operation being performed, in this case also the
   *   event being emitted.
   * @param {Object|Array} parameter Parameter is usually an object representing
   *   a single item, a criteria or an array with multiple items.
   * @param {Function} callback Function to run when the operation completes.
   */
  static do(connection, settings, operation, parameter, callback) {
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
  }

  /**
   * Define hidden property so this doesn't appear in loops.
   *
   * @param {Object} object Object to add the property to.
   * @param {String} property Property name.
   * @param {Mixed} value Property value.
   */
  static defineHiddenProperty(object, property, value) {
    Object.defineProperty(object, property, {
      writable: true,
      enumerable: false,
      configurable: true,
      value: value
    });
  }

  /**
   * Define setter for a given property.
   *
   * @param {Object} object Object to add the property to.
   * @param {String} property Property name.
   * @param {Function} setter The setter function which receives the incoming
   *   data and is responsible to store the data into the model object.
   */
  static defineSetter(object, property, setter) {
    Object.defineProperty(object, property, {
      set: setter
    });
  }

  /**
   * Invoke a lifecylcle callback.
   *
   * @param {connection} connection A connection or adapter instance.
   * @param {Object} settings The settings object.
   * @param {String} operation Operation being performed.
   * @param {Object|Array} parameter Parameter is usually an object representing
   *   a single item, a criteria or an array with multiple items.
   * @param {Function} callback Function to run when the operation completes.
   */
  static invoke(connection, settings, operation, parameter, callback) {
    if (!(operation in settings)) {
      return callback(null, parameter);
    }

    settings[operation].call(this, settings, parameter, function(error) {
      if (error) {
        throw error;
      }

      callback(null, parameter);
    })
  }

  /**
   * Compile and return a new model class for a model.
   *
   * @param {Object} server Xylem server instance.
   * @param {Object} settings The settings object.
   * @return {Function} Actually a subclass of Model, a new class object for a
   *   model.
   */
  static compile(server, settings) {
    let connection = server.connection(settings.connection);

    if (!connection) {
      return server.error('Unknown connection ' + settings.connection + '.');
    }

    // We create a new class to return it.
    class MockModel extends Model {

      constructor(values) {
        super(server, settings, values);
      }

      static list(criteria, callback) {
        // Allow callback to be the first argument when there's only one argument.
        if (!callback && criteria && typeof criteria === 'function') {
          callback = criteria;
          criteria = {};
        }

        // Create a query object if one wasn't passed in arguments.
        let query = criteria instanceof Query ? criteria : new Query(this, criteria);

        // If callback is set, execute it right way.
        if (callback) {
          let self = this;
          return Model.do(connection, settings, 'list', query, function(error, items) {
            if (error) {
              return callback(error);
            }

            let instances = [];
            items.forEach(function(item) {
              instances.push(new self(item));
            });
            callback(null, instances);
          });
        }

        // Otherwise return query object.
        return query;
      }

      static get(criteria, callback) {
        let query;

        if (criteria instanceof Query) {
          query = criteria;
        }
        else {
          let normalizedCriteria = Model.normalizeCriteria(settings, criteria);
          query = new Query(this, normalizedCriteria);
        }

        let self = this;
        Model.do(connection, settings, 'get', query, function(error, item) {
          if (error) {
            return callback(error);
          }

          callback(null, item ? new self(item) : null);
        });
      }

      static create(item, callback) {
        if (!(item instanceof this)) {
          // If item isn't an instance of its model, make it one.
          item = new this(item);
        }

        // If callback is supplied save item, otherwise just return the item to
        // be saved later.
        if (callback) {
          return item.save(callback);
        }

        return item;
      }

      static update(criteria, values, callback) {
        let normalizedCriteria = Model.normalizeCriteria(settings, criteria);

        this.list(normalizedCriteria, function(error, items) {
          if (error) {
            return callback(error);
          }

          async.each(items, function(item, next) {
            Object.assign(item, values);
            item.save(next);
          },
          function(error) {
            callback(error, items);
          });
        });
      }

      static destroy(criteria, callback) {
        let normalizedCriteria = Model.normalizeCriteria(settings, criteria);

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
      }

    }

    // Add static methods from settings.
    if (settings.statics) {
      Object.assign(MockModel, settings.statics);
    }

    return MockModel;
  }

  /**
   * Normalize criteria argument.
   *
   * @param {Object} settings Model settings object.
   * @param {Mixed} criteria A criteria scalar value (key) or a criteria object.
   * @return {Object} Normalized criteria object.
   */
  static normalizeCriteria(settings, criteria) {
    if (typeof criteria !== 'object') {
      let normalizedCriteria = {};
      normalizedCriteria[settings.key] = criteria;

      return normalizedCriteria;
    }

    return criteria;
  }

}

module.exports = Model;
