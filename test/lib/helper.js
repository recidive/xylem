/**
 * Helper functions.
 */

var Server = require('../../');
var Memory = require('../../lib/memory');

var helper = {};

/**
 * Create and return a server with a connection 'ephemeral' of the 'memory'
 * adapter.
 */
helper.server = function() {
  return new Server()
    .adapter('memory', Memory)
    .connection('ephemeral', 'memory:///');
}

module.exports = helper;
