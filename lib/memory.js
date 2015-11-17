'use strict'

const sift = require('sift');

/**
 * Xylem Memory Adapter.
 *
 * Ephemeral in-memory storage adapter.
 */
class MemoryAdapter {

  /**
   * Memory Adapter constructor.
   *
   * @constructor
   * @param {Object} settings Adapter settings.
   */
  constructor(settings) {
    this.settings = settings;

    // Data storage container.
    this.data = {};
  }

  /**
   * Initialize database connection.
   *
   * @param {Function} callback Function to run when initialized.
   */
  init(callback) {
    callback();
  }

  /**
   * List stored items.
   *
   * @param {Object} modelSettings Model settings object.
   * @param {Query} query Xylem query object.
   * @param {Function} callback Function to run when data is returned.
   */
  list(modelSettings, query, callback) {
    // @todo: sort and limit results.
    callback(null, sift(query.criteria, this.data[modelSettings.name]));
  }

  /**
   * Get a stored item.
   *
   * @param {Object} modelSettings Model settings object.
   * @param {Query} query Xylem query object.
   * @param {Function} callback Function to run when data is returned.
   */
  get(modelSettings, query, callback) {
    this.list(modelSettings, query, function(error, items) {
      callback(null, items[0]);
    });
  }

  /**
   * Save a item.
   *
   * @param {Object} modelSettings Model settings object.
   * @param {Object} item Object representing the item.
   * @param {Function} callback Function to run when data is saved.
   */
  save(modelSettings, item, callback) {
    let data = this.data;

    // Initialize container for this type.
    data[modelSettings.name] = data[modelSettings.name] || [];

    // Replace item.
    let replaced = false;
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
  }

  /**
   * Destroy an item.
   *
   * @param {Object} modelSettings Model settings object.
   * @param {Object} item Object representing the item.
   * @param {Function} callback Function to run when data is destroyed.
   */
  destroy(modelSettings, item, callback) {
    let data = this.data;

    if (modelSettings.name in data) {
      data[modelSettings.name].forEach(function(storedItem, index) {
        if (item[modelSettings.key] === storedItem[modelSettings.key]) {
          data[modelSettings.name].splice(index, 1);
        }
      });
    }

    callback(null, item);
  }

}

module.exports = MemoryAdapter;
