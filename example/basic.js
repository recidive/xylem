'use strict'

const Server = require('../');
const Memory = require('../lib/memory');

// Create server.
const server = new Server();

// Set adapters and create connections.
server
  .adapter('memory', Memory)
  .connection('ephemeral', 'memory:///');

// Create 'contact' model.
server.model('contact', {
  connection: 'ephemeral',
  fields: {
    id: 'number',
    name: 'string',
    email: 'string'
  },
  key: 'id'
});

server.init(function() {
  // Get 'contact' model.
  const Contact = server.model('contact');

  // Create 'john' contact instance.
  let john = Contact.create({
    id: 1,
    name: 'John',
    email: 'john@example.com'
  });

  // Save contact.
  john.save(function (error, john) {
    if (error) {
      throw error;
    }

    console.log(john, 'save()');

    // Get a list of contacts.
    Contact.list(function (error, contacts) {
      if (error) {
        throw error;
      }

      console.log(contacts, 'list()');
    });
  });
});
