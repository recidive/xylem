/**
 * Sample schema.
 */

var schema = {};

schema.address = {
  name: 'address',
  fields: {
    street: 'string',
    city: 'string',
    state: 'string',
    country: 'string'
  },
  key: 'id'
};

schema.contact = {
  name: 'contact',
  connection: 'ephemeral',
  fields: {
    id: 'number',
    name: 'string',
    email: 'string',
    // addresses: {
    //   type: 'reference',
    //   reference: 'address',
    //   multiple: true
    // }
  },
  key: 'id'
};

schema.addressBook = {
  name: 'addressBook',
  connection: 'ephemeral',
  fields: {
    id: 'number',
    contacts: {
      type: 'reference',
      reference: 'contact',
      multiple: true
    }
  },
  key: 'id'
};

module.exports = schema;
