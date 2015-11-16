'use strict'

const assert = require('assert');
const async = require('async');
const Model = require('../lib/model');
const Memory = require('../lib/memory');
const Query = require('../lib/query');
const helper = require('./lib/helper');
const schema = require('./lib/schema');
const samples = require('./lib/samples');
const sample = samples[0];

var Contact;
var AddressBook;

describe('Model', function() {

// Indentation is -2 spaces.

beforeEach((done) => {
  var server = helper.server();

  // Create Contact model programmatically for testing.
  Contact = Model.compile(server, schema.contact);

  server.init(done);
});

describe('#create()', function() {

  it('should save an item when a callback is passed', (done) => {
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

  it('should allow saving later when callback is omitted', (done) => {
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

  beforeEach((done) => {
    Contact.create(sample, function (error, john) {
      if (error) {
        return done(error);
      }
      done();
    });
  });

  it('should get an item with its key', (done) => {
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

  it('should get an item with a criteria object', (done) => {
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

function createMultipleSamples(callback) {
  async.each(samples, function(sample, next) {
    Contact.create(sample, function (error, john) {
      if (error) {
        return next(error);
      }
      next();
    });
  }, callback);
}

describe('#list()', function() {

  beforeEach(createMultipleSamples);

  it('should list all items', (done) => {
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

  it('should list items that match a criteria object', (done) => {
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

  it('should return a query object when callback is ommitted', (done) => {
    var query = Contact.list({
      id: sample.id
    });

    assert.ok(query instanceof Query);

    query.execute(function(error, contacts) {
      if (error) {
        return done(error);
      }

      assert.ok(contacts);
      assert.ok(contacts instanceof Array);
      assert.equal(contacts.length, 1);
      done();
    })
  });

});

describe('#update()', function() {

  beforeEach(createMultipleSamples);

  it('should update an item by its key', (done) => {
    var newEmail = 'newemail@example.com';

    Contact.update(sample.id, {
      email: newEmail
    },
    function (error, contacts) {
      if (error) {
        return done(error);
      }

      assert.ok(contacts);
      assert.ok(contacts instanceof Array);
      assert.equal(contacts.length, 1);
      assert.equal(contacts[0].email, newEmail)
      done();
    });
  });

  it('should update items that match a criteria', (done) => {
    var newEmail = 'newemail@example.com';

    Contact.update({
      id: sample.id
    },
    {
      email: newEmail
    },
    function (error, contacts) {
      if (error) {
        return done(error);
      }

      assert.ok(contacts);
      assert.ok(contacts instanceof Array);
      assert.equal(contacts.length, 1);
      assert.equal(contacts[0].email, newEmail)
      done();
    });
  });

});

describe('#destroy()', function() {

  beforeEach(createMultipleSamples);

  it('should destroy an item by its key', (done) => {
    Contact.destroy(sample.id, function (error, contacts) {
      if (error) {
        return done(error);
      }

      assert.ok(contacts);
      assert.ok(contacts instanceof Array);
      assert.equal(contacts.length, 1);

      Contact.get(sample.id, function (error, contact) {
        if (error) {
          return done(error);
        }

        assert.ifError(contact);
        done();
      });
    });
  });

  it('should destroy items that match a criteria', (done) => {
    Contact.destroy({
      id: sample.id
    },
    function (error, contacts) {
      if (error) {
        return done(error);
      }

      assert.ok(contacts);
      assert.ok(contacts instanceof Array);
      assert.equal(contacts.length, 1);

      Contact.get(sample.id, function (error, contact) {
        if (error) {
          return done(error);
        }

        assert.ifError(contact);
        done();
      });
    });
  });

});

});
