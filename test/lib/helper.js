'use strict'

/**
 * Helper functions.
 */

const Server = require('../../');
const Memory = require('../../lib/memory');
const helper = {};

/**
 * Create and return a server with a connection 'ephemeral' of the 'memory'
 * adapter.
 */
helper.server = () => {
  return new Server()
    .adapter('memory', Memory)
    .connection('ephemeral', 'memory:///');
};

module.exports = helper;
