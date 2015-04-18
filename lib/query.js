/*
 * Xylem Query.
 *
 * Handle query objects and criteria.
 */

var extend = require('extend');

/**
 * Query constructor.
 *
 * @constructor
 * @param {Model} model Model object.
 */
function Query(model, criteria) {
  this.model = model;
  this.criteria = criteria || {};
  this.skip = 0;
  this.limit = 0;
  this.populate = [];
  this.sort = {};
};

/**
 * Add criteria.
 *
 * @param {Object} criteria Criteria object or fragment.
 */
Query.prototype.criteria = function(criteria) {
  extend(this.criteria, criteria);
  return this;
};

/**
 * Populate reference fields.
 *
 * @param {...String|Array} fieldName One or more reference field name or an
 *   array of field names.
 */
Query.prototype.populate = function() {
  this.populate.concat(Array.prototype.slice.call(arguments));
  return this;
};

/**
 * Sorting criteria.
 *
 * @param {String|Object} fieldName A string with fieldName or an object with
 *   fieldName as key and sort order as value (true for ascending, false for
 *   descending).
 * @param {Boolean} order Used when fieldName parameter is a string to set the
 *   sort order, true (default) for ascending, false for descending.
 */
Query.prototype.sort = function(fieldName, order) {
  if (typeof fieldName === 'object') {
    extend(this.sort, fieldName);
  }
  else {
    var clause = {};
    clause[fieldName] = order || true;
    extend(this.sort, clause);
  }

  return this;
};

/**
 * Skip results.
 *
 * @param {Number} skip How many items to skip.
 */
Query.prototype.skip = function(skip) {
  this.skip = skip;
  return this;
};

/**
 * Limit query results.
 *
 * @param {Number} limit How many items to return.
 */
Query.prototype.limit = function(limit) {
  this.limit = limit;
  return this;
};

/**
 * Paginate results.
 *
 * @param {Number} skip How many items to skip.
 * @param {Number} limit How many items to return.
 */
Query.prototype.paginate = function(skip, limit) {
  return this
    .skip(skip)
    .limit(limit);
};

/**
 * Execute query.
 *
 * @param {Function} callback Callback to run when complete.
 */
Query.prototype.execute = function(callback) {
  this.model.list(this, callback);
};

module.exports = Query;
