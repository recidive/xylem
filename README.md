# ![Xylem](https://raw.githubusercontent.com/recidive/xylem/master/docs/xylem-github.png)

Xylem provides a mechanism to persist and manipulate data on the file system, memory or a database server.

Differently from other ORM/ODM tools out there, Xylem allows you to reference and combine data from different sources, making it the ultimate storage abstraction library to back a REST server, a CMS or any other data driven application.

## Getting started

### Installing Xylem

    $ npm install xylem

### Installing an adapter

    $ npm install xylem-mongodb

### Creating connections

To create a connection on Xylem first you need to setup an adapter using the `adapter()` method, than you can use the `connection()` method to setup the connection itself.

```js
var Server = require('xylem');
var MongoDB = require('xylem-mongodb');

var server = new Server();

server
  .adapter('mongodb', MongoDB)
  .connection('database', 'mongodb://localhost/xylem');
```

### Creating models

Models can be created with de `model()` method. To learn more about Xylem schema, you can read the [schema documentation](https://github.com/recidive/xylem/blob/master/docs/schema.md).

```js
server.model('contact', {
  connection: 'database',
  fields: {
    id: 'string',
    name: 'string',
    email: 'string'
  },
  key: 'id'
});
```

### Storing and retrieving data

```js
var Contact = server.model('contact');

var john = new Contact({
  id: 1,
  name: 'John',
  email: 'john@example.com'
});

john.save(function (error, john) {
  console.log(john);

  // Get John.
  Contact.get(john.id, function (error, contact) {
    console.log(contact);
  });

  // Get a list of contacts.
  Contact.list({}, function (error, contacts) {
    console.log(contacts);
  });
});
```

## Adapters

Xylem adapters are the bridge between Xylem and the underlying storage system.

 - Memory (Built in)
 - [MongoDB](https://github.com/recidive/xylem-mongodb)

## Lifecycle callbacks

Save operation

 - `beforeSave(settings, item, callback)`
 - `afterSave(settings, item, callback)`

List operation

 - `beforeList(settings, query, callback)`
 - `afterList(settings, items, callback)`

Get operation

 - `beforeGet(settings, key, callback)`
 - `afterGet(settings, item, callback)`

Destroy operation

 - `beforeDestroy(settings, key, callback)`
 - `afterDestroy(settings, item, callback)`

## Features

 - Pluggable adapters
 - Multiple connections
 - Model relationships
 - Model mixins
 - Embedded references
 - Query builder
