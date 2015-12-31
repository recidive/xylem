'use strict'

const Server = require('../');
const Memory = require('../lib/memory');

// Create server.
const server = new Server();

// Set adapters and create connections.
server
  .adapter('memory', Memory)
  .connection('ephemeral', 'memory:///')

  // Create 'contact' model.
  .model('contact', {
    connection: 'ephemeral',
    fields: {
      id: 'number',
      name: 'string',
      email: 'string'
    },
    key: 'id'
  });

// Get 'contact' model.
const Contact = server.model('contact');

server.init(() => {
  // Create 'john' contact instance.
  let john = new Contact({
    id: 1,
    name: 'John',
    email: 'john@example.com'
  });

  // Save contact.
  john.save((error, john) => {
    if (error)
      throw error;

    console.log(john, 'John');

    // Get a list of contacts.
    Contact.list((error, contacts) => {
      if (error)
        throw error;

      console.log(contacts, 'Contacts');
    });
  });
});
