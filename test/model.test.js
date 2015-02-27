var assert = require('assert');
var Server = require('../');
var Memory = require('../lib/memory');
var server;

// Sample schema,
var schema = {
  connection: 'ephemeral',
  fields: {
    id: 'string',
    name: 'string',
    email: 'string'
  },
  key: 'id'
};

// Sample data.
var sample = {
  id: 1,
  name: 'John',
  email: 'john@example.com'
};

describe('Model', function(done) {

  beforeEach(function(done) {
    server = new Server();

    server
      .adapter('memory', Memory)
      .connection('ephemeral', 'memory:///');

    done();
  });


  it('should create a model', function(done) {
    server.model('contact', schema);

    var Contact = server.model('contact');

    assert.ok(Contact);
    done();
  });

  it('should create and save an item of a model', function(done) {
    server.model('contact', schema);

    var Contact = server.model('contact');

    // Create 'john' contact instance.
    var john = new Contact(sample);

    // Save contact.
    john.save(function (error, john) {
      if (error) {
        throw error;
      }

      assert.ok(john);
      assert.ok(john instanceof Contact);
      done();
    });
  });

});