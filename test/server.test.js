var assert = require('assert');
var Server = require('../');
var Memory = require('../lib/memory');
var server;

describe('Server', function() {

// Indentation is -2 spaces.

beforeEach(function(done) {
  server = new Server();
  done();
});

describe('#adapter()', function() {

  it('should register an adapter', function(done) {
    server
      .adapter('memory', Memory);

    var adapter = server.adapter('memory');

    assert.ok(adapter);
    assert.equal(adapter, Memory);
    done();
  });

});

describe('#connection()', function() {

  it('should add a connection', function(done) {
    server
      .adapter('memory', Memory)
      .connection('ephemeral', 'memory:///');

    var connection = server.connection('ephemeral');

    assert.ok(connection);
    assert.ok(connection instanceof Memory);
    done();
  });

});

describe('#init()', function() {

  it('should initialize', function(done) {
    server
      .adapter('memory', Memory)
      .connection('ephemeral', 'memory:///');

    server.init(function(error) {
      if (error) {
        return done(error);
      }

      done();
    });
  });

});

function createConnection(done) {
  server
    .adapter('memory', Memory)
    .connection('ephemeral', 'memory:///');

  server.init(done);
}

describe('#model()', function() {

  beforeEach(createConnection);

  it('should add a model', function(done) {
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

});
