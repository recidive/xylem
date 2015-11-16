'use strict'

const assert = require('assert');
const Server = require('../');
const Memory = require('../lib/memory');

var server;

describe('Server', () => {

// Indentation is -2 spaces.

beforeEach((done) => {
  server = new Server();
  done();
});

describe('#adapter()', () => {

  it('should register an adapter', (done) => {
    server
      .adapter('memory', Memory);

    let adapter = server.adapter('memory');

    assert.ok(adapter);
    assert.equal(adapter, Memory);
    done();
  });

});

describe('#connection()', () => {

  it('should add a connection', (done) => {
    server
      .adapter('memory', Memory)
      .connection('ephemeral', 'memory:///');

    let connection = server.connection('ephemeral');

    assert.ok(connection);
    assert.ok(connection instanceof Memory);
    done();
  });

});

describe('#init()', () => {

  it('should initialize', (done) => {
    server
      .adapter('memory', Memory)
      .connection('ephemeral', 'memory:///');

    server.init((error) => {
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

describe('#model()', () => {

  beforeEach(createConnection);

  it('should add a model', (done) => {
    server.model('contact', {
      connection: 'ephemeral',
      fields: {
        id: 'string',
        name: 'string',
        email: 'string'
      },
      key: 'id'
    });

    let model = server.model('contact');

    assert.ok(model);
    assert.ok(model instanceof Function);
    done();
  });

});

});
