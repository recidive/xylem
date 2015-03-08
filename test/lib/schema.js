/**
 * Sample schema.
 */

var schema = {
  name: 'contact',
  connection: 'ephemeral',
  fields: {
    id: 'number',
    name: 'string',
    email: 'string'
  },
  key: 'id'
};

module.exports = schema;
