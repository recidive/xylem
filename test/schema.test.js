var assert = require('assert');
var Schema = require('../lib/schema');
var schema;

// Sample schema,
var sampleSchema = {
  connection: 'ephemeral',
  fields: {
    id: 'number',
    name: 'string',
    active: 'boolean',
    address: 'object',
    phones: 'array'
  },
  key: 'id'
};

describe('Schema#check', function(done) {

  beforeEach(function(done) {
    schema = new Schema(sampleSchema);

    done();
  });


  it('should not allow a non numeric value on a number field', function(done) {
    var errors = schema.check({
      id: 'abcd',
      name: 'John'
    });

    assert.ok(errors instanceof Array);
    assert.equal(errors[0], 'Invalid value "abcd" for field "id".');
    done();
  });

  it('should not allow a non string value on a string field', function(done) {
    var errors = schema.check({
      id: 123,
      name: 123
    });

    assert.ok(errors instanceof Array);
    assert.equal(errors[0], 'Invalid value "123" for field "name".');
    done();
  });

  it('should not allow a non boolean value on a boolean field', function(done) {
    var errors = schema.check({
      id: 123,
      name: 'John',
      active: 'abcd'
    });

    assert.ok(errors instanceof Array);
    assert.equal(errors[0], 'Invalid value "abcd" for field "active".');
    done();
  });

  it('should not allow a non object value on an object field', function(done) {
    var errors = schema.check({
      id: 123,
      name: 'John',
      address: 'address string'
    });

    assert.ok(errors instanceof Array);
    assert.equal(errors[0], 'Invalid value "address string" for field "address".');
    done();
  });


  it('should not allow a non array value on an array field', function(done) {
    var errors = schema.check({
      id: 123,
      name: 'John',
      phones: 'phone string'
    });

    assert.ok(errors instanceof Array);
    assert.equal(errors[0], 'Invalid value "phone string" for field "phones".');
    done();
  });

});
