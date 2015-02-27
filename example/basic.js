var Server = require('../');
var Memory = require('../lib/memory');

// Create server.
var server = new Server();

// Set adapters and create connections.
server
  .adapter('memory', Memory)
  .connection('ephemeral', 'memory:///');

// Create 'contact' model.
server.model('contact', {
  connection: 'ephemeral',
  fields: {
    id: 'string',
    name: 'string',
    email: 'string'
  },
  key: 'id'
});

server.init(function() {
  // Get 'contact' model.
  var Contact = server.model('contact');

  // Create 'john' contact instance.
  var john = new Contact({
    id: 1,
    name: 'John',
    email: 'john@example.com'
  });

  // Save contact.
  john.save(function (error, john) {
    console.log(john);

    // Get a list of contacts.
    Contact.list({}, function (error, contacts) {
      console.log(contacts);
    });
  });
});
