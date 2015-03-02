/*
 * Xylem Schema.
 *
 * A schema object holds model properties and perform primitive types
 * validation.
 */

/**
 * Schema constructor.
 *
 * @constructor
 * @param {Object} settings Schema definition object.
 */
function Schema(settings) {
  this.settings = settings;
  this.settings.fields = this.normalizeFields(this.settings.fields);
};

/**
 * Validate data against schema.
 *
 * @param {Object} data Data to be validated.
 * @return {Mixed} Array with errors if validation fails or true if it passes.
 */
Schema.prototype.check = function (data) {
  // @todo
  // Validate required and unique.
  // Return errors when schema is invalid.
  var fields = this.settings.fields
  var errors = [];
  for (var fieldName in fields) {
    if (!(fieldName in data)) {
      // No value supplied, so nothing to validate.
      continue;
    }

    var value = data[fieldName];

    if (!this.checkField(fields[fieldName], value)) {
      errors.push('Invalid value "' + value + '" for field "' + fieldName + '".');
    }
  }

  return errors.length > 0 ? errors : true;
};

/**
 * Validate data against schema.
 *
 * @param {Mixed} value Data to be validated.
 */
Schema.prototype.checkField = function (fieldSettings, value) {
  switch (fieldSettings.type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return typeof value === 'object' && value instanceof Array;
    case 'object':
      return typeof value === 'object';
    case 'date':
    case 'datetime':
      // @todo validate date and datetime fields.
      return true;
    case 'reference':
      // @todo validate referenced items.
      if (fieldSettings.multiple) {
        return typeof value === 'object' && value instanceof Array;
      }
      return typeof value === 'object';
  };
};

/**
 * Normalize fields definition.
 *
 * @param {Object} fields Fields definition object from schema.
 * @return {Object} Normalized fields definition object.
 */
Schema.prototype.normalizeFields = function (fields) {
  for (var fieldName in fields) {
    fields[fieldName] = this.normalizeField(fields[fieldName]);
  }

  return fields;
};

/**
 * Normalize field definition.
 *
 * @param {Mixed} field Field definition object or string with field type.
 * @return {Object} Field definition object.
 */
Schema.prototype.normalizeField = function (field) {
  if (typeof field === 'string') {
    return {
      type: field
    };
  }

  return field;
};

module.exports = Schema;