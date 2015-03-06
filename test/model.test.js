var assert = require('assert');
var Model = require('../lib/model');
var Memory = require('../lib/memory');
var Contact;

// Sample schema,
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

// Sample data.
var sample = {
  id: 1,
  name: 'John',
  email: 'john@example.com'
};

describe('Model#create', function(done) {

  beforeEach(function(done) {
    var connection = new Memory({});
    Contact = Model.compile(connection, schema);
    done();
  });

  it('should create and save an item when a callback is passed', function(done) {
    Contact.create(sample, function (error, john) {
      if (error) {
        throw error;
      }

      assert.ok(john);
      assert.ok(john instanceof Contact);

      // Get item to check it was really persisted.
      Contact.get(sample.id, function (error, contact) {
        if (error) {
          throw error;
        }

        assert.ok(contact);
        assert.ok(contact instanceof Contact);
        done();
      });
    });
  });

  it('should create an item and allow saving it later when callback is omitted', function(done) {
    // Create 'john' contact instance.
    var john = Contact.create(sample);

    // Save contact.
    john.save(function (error, john) {
      if (error) {
        throw error;
      }

      assert.ok(john);
      assert.ok(john instanceof Contact);

      // Get item to check it was really persisted.
      Contact.get(sample.id, function (error, contact) {
        if (error) {
          throw error;
        }

        assert.ok(contact);
        assert.ok(contact instanceof Contact);
        done();
      });
    });
  });

});
