/*
 * Xylem Memory Adapter.
 *
 * Ephemeral in-memory storage adapter.
 */

/**
 * Memory Adapter constructor.
 *
 * @constructor
 * @param {Object} settings Storage settings.
 */
function MemoryAdapter(settings) {
  this.settings = settings || {};

  // Data storage container.
  this.data = this.settings.data || {};
};

/**
 * Initialize database connection.
 */
 MemoryAdapter.prototype.init = function(callback) {
  callback();
};

/**
 * List stored items.
 *
 * @param {Object} modelSettings Model settings object.
 * @param {Object} criteria Criteria object.
 * @param {Function} callback Function to run when data is returned.
 */
MemoryAdapter.prototype.list = function(modelSettings, criteria, callback) {
  // Allow filtering by key.
  if (typeof criteria[modelSettings.key] !== 'undefined') {
    var key = criteria[modelSettings.key];
    var result = this.data[modelSettings.name].filter(function(element) {
      return element[modelSettings.key] == key;
    });

    return callback(null, result);
  }

  // Otherwise list all items of this kind.
  callback(null, this.data[modelSettings.name]);
};

/**
 * Get a stored item.
 *
 * @param {Object} modelSettings Model settings object.
 * @param {Mixed} criteria Item key or criteria object to search for.
 * @param {Function} callback Function to run when data is returned.
 */
MemoryAdapter.prototype.get = function(modelSettings, criteria, callback) {
  this.list(modelSettings, criteria, function(error, items) {
    callback(null, items[0]);
  });
};

/**
 * Save a item.
 *
 * @param {Object} modelSettings Model settings object.
 * @param {Object} item Object representing the item.
 * @param {Function} callback Function to run when data is saved.
 */
MemoryAdapter.prototype.save = function(modelSettings, item, callback) {
  // Initialize container for this type.
  this.data[modelSettings.name] = this.data[modelSettings.name] || [];

  // Store item.
  this.data[modelSettings.name].push(item);

  callback(null, item);
};

/**
 * Destroy an item.
 *
 * @param {Object} modelSettings Model settings object.
 * @param {String} key Item key to search for.
 * @param {Function} callback Function to run when data is destroyed.
 */
MemoryAdapter.prototype.destroy = function(modelSettings, key, callback) {
  this.get(modelSettings, key, function(error, item) {
    this.data[modelSettings.name].splice(this.data[modelSettings.name].indexOf(item), 1);
    callback(null, item);
  });
};

module.exports = MemoryAdapter;
