var assert = require('assert');
var Model = require('../lib/model');
var Memory = require('../lib/memory');
var schema = require('./lib/schema');
var Contact;

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

  it('should save an item when a callback is passed', function(done) {
    Contact.create(sample, function (error, john) {
      if (error) {
        return done(error);
      }

      assert.ok(john);
      assert.ok(john instanceof Contact);

      // Get item to check it was really persisted.
      Contact.get(sample.id, function (error, contact) {
        if (error) {
          return done(error);
        }

        assert.ok(contact);
        assert.ok(contact instanceof Contact);
        done();
      });
    });
  });

  it('should allow saving later when callback is omitted', function(done) {
    // Create 'john' contact instance.
    var john = Contact.create(sample);

    // Save contact.
    john.save(function (error, john) {
      if (error) {
        return done(error);
      }

      assert.ok(john);
      assert.ok(john instanceof Contact);

      // Get item to check it was really persisted.
      Contact.get(sample.id, function (error, contact) {
        if (error) {
          return done(error);
        }

        assert.ok(contact);
        assert.ok(contact instanceof Contact);
        done();
      });
    });
  });

});
