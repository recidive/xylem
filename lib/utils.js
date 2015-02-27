/*
 * Xylem Utility functions.
 */

var utils = {};

/**
 * Capitalize the first letter of a string.
 *
 * @param {String} string Text to capitalize the first letter.
 */
utils.capitalizeFirstLetter = function(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = utils;
