var assert = require('assert');
var async = require('async');
var Model = require('../lib/model');
var Memory = require('../lib/memory');
var schema = require('./lib/schema');
var samples = require('./lib/samples');
var sample = samples[0];
var Contact;

describe('Model', function() {

// Indentation is -2 spaces.

beforeEach(function(done) {
  var connection = new Memory({});
  Contact = Model.compile(connection, schema);
  done();
});

describe('#create()', function() {

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

describe('#get()', function() {

  beforeEach(function(done) {
    Contact.create(sample, function (error, john) {
      if (error) {
        return done(error);
      }
      done();
    });
  });

  it('should get an item with its key', function(done) {
    // Get item just saved.
    Contact.get(sample.id, function (error, contact) {
      if (error) {
        return done(error);
      }

      assert.ok(contact);
      assert.ok(contact instanceof Contact);
      done();
    });
  });

  it('should get an item with a criteria object', function(done) {
    // Get item with a criteria.
    Contact.get({
      id: sample.id
    },
    function (error, contact) {
      if (error) {
        return done(error);
      }

      assert.ok(contact);
      assert.ok(contact instanceof Contact);
      done();
    });
  });

});

describe('#list()', function() {

  beforeEach(function(done) {
    async.each(samples, function(sample, next) {
      Contact.create(sample, function (error, john) {
        if (error) {
          return next(error);
        }
        next();
      });
    }, done);
  });

  it('should list all items', function(done) {
    // Get item with a criteria.
    Contact.list(function (error, contacts) {
      if (error) {
        return done(error);
      }

      assert.ok(contacts);
      assert.ok(contacts instanceof Array);
      assert.equal(contacts.length, 3);
      done();
    });
  });

  it('should list items that match a criteria object', function(done) {
    // Get item with a criteria.
    Contact.list({
      id: sample.id
    },
    function (error, contacts) {
      if (error) {
        return done(error);
      }

      assert.ok(contacts);
      assert.ok(contacts instanceof Array);
      assert.equal(contacts.length, 1);
      done();
    });
  });

});

});
