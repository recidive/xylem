# ![Xylem](https://raw.githubusercontent.com/recidive/xylem/master/docs/xylem-logo.png)

Xylem is a powerful mechanism to persist and manipulate objects on a database server, file system or memory.

Xylem allows you to reference and combine data from different sources. You can use it to build a REST server, a CMS or any other data driven application.

Xylem aims to be lightweight and unopinionated. Stuff like validation, id generation and high level data types is left to your application to implement.

## Getting started

### Installing Xylem

    $ npm install xylem

### Installing an adapter

    $ npm install xylem-mongodb

### Creating connections

To create a connection on Xylem first you need to setup an adapter using the `adapter()` method, then you can use the `connection()` method to setup the connection itself.

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

var john = Contact.create({
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
  Contact.list(function (error, contacts) {
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

 - `beforeList(settings, criteria, callback)`
 - `afterList(settings, items, callback)`

Get operation

 - `beforeGet(settings, criteria, callback)`
 - `afterGet(settings, item, callback)`

Destroy operation

 - `beforeDestroy(settings, criteria, callback)`
 - `afterDestroy(settings, item, callback)`

## Features

 - Multiple pluggable adapters and multiple connections
 - Cross database model relationships
 - Model mixins
 - Embedded items
