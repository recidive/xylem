var assert = require('assert');
var Schema = require('../lib/schema');
var schema;

// Sample schema,
var sampleSchema = {
  connection: 'ephemeral',
  fields: {
    id: 'number',
    name: 'string',
    active: 'boolean'
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
      id: 'abcd'
    });

    assert.ok(errors instanceof Array);
    done();
  });


  it('should not allow a non string value on a string field', function(done) {
    var errors = schema.check({
      id: 123,
      name: 123
    });

    assert.ok(errors instanceof Array);
    done();
  });

  it('should not allow a non boolean value on a boolean field', function(done) {
    var errors = schema.check({
      id: 123,
      name: 123,
      active: 'abcd'
    });

    assert.ok(errors instanceof Array);
    done();
  });

});
