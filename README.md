# Xylem

Xylem provides a mechanism to persist and manipulate data on the file system, memory or a database server.

Differently from other ORM/ODM tools out there, Xylem allows you to reference and combine data from different sources, making it the ultimate storage abstraction library to back a REST server, a CMS or any other data driven application.

## Getting started

### Installing Xylem

```
npm install xylem
```

### Installing an adapter

```
npm install xylem-mongodb
```

### Creating connections

```js
var server = require('xylem');
var MongoDB = require('xylem-mongodb');

server
  .adapter('mongodb', MongoDB)
  .connection('database', 'mongodb://localhost/xylem');
```

### Creating models

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

  // Get a list of contacts.
  Contact.list({}, function (error, contacts) {
    console.log(contacts);
  })
});
```

## Adapters

Xylem adapters are the bridge between Xylem and the underlying storage system.

 - Memory (Built in)
 - MongoDB

## Lifecycle callbacks

Save operation

 - ```beforeSave(settings, item, callback)```
 - ```afterSave(settings, item, callback)```

List operation

 - ```beforeList(settings, query, callback)```
 - ```afterList(settings, items, callback)```

Get operation

 - ```beforeGet(settings, key, callback)```
 - ```afterGet(settings, item, callback)```

Destroy operation

 - ```beforeDestroy(settings, key, callback)```
 - ```afterDestroy(settings, item, callback)```

## Features

 - Pluggable adapters
 - Multiple storages
 - Object relationship
 - Polymorphic objects (subtyping)
 - Embedded objects
 - Query builder
