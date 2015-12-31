'use strict'

const Server = require('../');
const Memory = require('../lib/memory');
const async = require('async');

let server = new Server();

// Set adapters and create connections.
server
  .adapter('memory', Memory)
  .connection('ephemeral', 'memory:///')

  // Create the Person model.
  .model('person', {
    connection: 'ephemeral',
    fields: {
      name: 'string'
    },
    key: 'name'
  })

  // Create the City model.
  .model('city', {
    connection: 'ephemeral',
    fields: {
      name: 'string'
    },
    key: 'name'
  })

  // Create the House model.
  .model('house', {
    connection: 'ephemeral',
    fields: {
      name: 'string',
      address: 'string',
      // one-to-one relationship.
      city: {
        type: 'reference',
        reference: 'city',
        multiple: false
      },
      // many-to-many relationship.
      residents: {
        type: 'reference',
        reference: 'person',
        multiple: true
      }
    },
    key: 'name'
  });

const Person = server.model('person');
const City = server.model('city');
const House = server.model('house');

// Create John.
const john = new Person({
  name: 'John'
});

// Create newYork.
const newYork = new City({
  name: 'New York'
});

// Create John's house.
const johnsHouse = new House({
  name: "John's house",
  address: '12, John st',
  city: newYork,
  residents: [john]
});

// Create Mary.
const mary = new Person({
  name: 'Mary'
});

async.series([
  (next) => server.init(next),
  (next) => john.save(next),
  (next) => newYork.save(next),
  (next) => johnsHouse.save(next),
  (next) => mary.save((error, mary) => {
    // Add Mary as resident of John's house.
    johnsHouse.residents.push(mary);
    johnsHouse.save(next);
  }),
], (error, result) => {
  if (error)
    throw error;

  Person
    .list((error, people) => {
      if (error)
        throw error;

      console.log(people, 'People list');

      House.get("John's house", (error, house) => {
        if (error)
          throw error;

        console.log(house, "John's house");
      });
    });
});
