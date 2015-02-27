var assert = require('assert');
var Server = require('../');
var Memory = require('../lib/memory');
var server;

describe('Server', function(done) {
  beforeEach(function(done) {
    server = new Server();
    done();
  });

  it('should register an adapter', function(done) {
    server
      .adapter('memory', Memory);

    var adapter = server.adapter('memory');

    assert.ok(adapter);
    assert.equal(adapter, Memory);
    done();
  });

  it('should add a connection', function(done) {
    server
      .adapter('memory', Memory)
      .connection('ephemeral', 'memory:///');

    var connection = server.connection('ephemeral');

    assert.ok(connection);
    assert.ok(connection instanceof Memory);
    done();
  });

  it('should add a model', function(done) {
    server
      .adapter('memory', Memory)
      .connection('ephemeral', 'memory:///');

    server.model('contact', {
      connection: 'ephemeral',
      fields: {
        id: 'string',
        name: 'string',
        email: 'string'
      },
      key: 'id'
    });

    var model = server.model('contact');

    assert.ok(model);
    done();
  });

});
