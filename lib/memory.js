/*
 * Xylem Memory Adapter.
 *
 * Ephemeral in-memory storage adapter.
 */

var sift = require('sift');

/**
 * Memory Adapter constructor.
 *
 * @constructor
 * @param {Object} settings Storage settings.
 */
function MemoryAdapter(settings) {
  this.settings = settings;

  // Data storage container.
  this.data = {};
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
 * @param {Query} query Xylem query object.
 * @param {Function} callback Function to run when data is returned.
 */
MemoryAdapter.prototype.list = function(modelSettings, query, callback) {
  // @todo: sort and limit results.
  callback(null, sift(query.criteria, this.data[modelSettings.name]));
};

/**
 * Get a stored item.
 *
 * @param {Object} modelSettings Model settings object.
 * @param {Query} query Xylem query object.
 * @param {Function} callback Function to run when data is returned.
 */
MemoryAdapter.prototype.get = function(modelSettings, query, callback) {
  this.list(modelSettings, query, function(error, items) {
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
  var data = this.data;

  // Initialize container for this type.
  data[modelSettings.name] = data[modelSettings.name] || [];

  // Replace item.
  var replaced = false;
  data[modelSettings.name].forEach(function(storedItem, index) {
    if (item[modelSettings.key] === storedItem[modelSettings.key]) {
      data[modelSettings.name].splice(index, 1, item);
      replaced = true;
    }
  });

  if (!replaced) {
    // Item wasn't replaced so we need to add it.
    data[modelSettings.name].push(item);
  }

  callback(null, item);
};

/**
 * Destroy an item.
 *
 * @param {Object} modelSettings Model settings object.
 * @param {Object} item Object representing the item.
 * @param {Function} callback Function to run when data is destroyed.
 */
MemoryAdapter.prototype.destroy = function(modelSettings, item, callback) {
  var data = this.data;

  if (modelSettings.name in data) {
    data[modelSettings.name].forEach(function(storedItem, index) {
      if (item[modelSettings.key] === storedItem[modelSettings.key]) {
        data[modelSettings.name].splice(index, 1);
      }
    });
  }

  callback(null, item);
};

module.exports = MemoryAdapter;
