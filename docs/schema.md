# Schema

 > **Disclaimer:** this is a working in progress. Not everything documented here is implemented yet and it's subject to change.

Schema provides the metadata for models, it contains information about fields, references and what connection the model will use.

## Field types

Xylem implements the [JSON schema primitive types](http://json-schema.org/latest/json-schema-core.html#anchor8) plus three more field types (date, datetime and reference).

 - string
 - number (includes integer)
 - boolean
 - array
 - object
 - date
 - datetime
 - reference

## Field definition

For field definitions you can use a simple string with the type name or an object with field type plus other field settings.

### String with type name:

```js
server.model('person', {
  connection: 'memory',
  fields: {
    id: 'number',
    name: 'string',
    age: 'number'
  },
  key: 'name'
});
```

### Object with field settings:

```js
server.model('person', {
  connection: 'memory',
  fields: {
    id: {
      type: 'number'
    },
    name: {
      type: 'string'
    },
    age: {
      type: 'number',
      required: true,
      index: true
    }
  },
  key: 'name'
});
```

All field types have the `required` property. The scalar field types `string`, `integer` and `number` have the `index` and `unique` properties. The `reference` field type has the `reference`, `embedded`, `multiple`, `populate` and `via` properties.

**Note:** field definitions are normalized into objects before being used by Xylem and its components internally.

### Reference fields

References allow declaring the relationship between your models. The extra properties we have for reference fields are:

 - **reference:** set what model this field references to.
 - **embedded:** setup an embedded reference.
 - **multiple:** setup a multiple reference.
 - **via:** set the field that reference this type on the referenced type in a one-to-many relationship.

```js
server.model('person', {
  connection: 'memory',
  fields: {
    id: 'number',
    name: 'string',
    phones: {
      type: 'reference',
      reference: 'phone',
      embedded: true,
      multiple: true
    }
  },
  key: 'name'
});
```

Reference fields will use primitive types `array` or `object` whether if it's multiple or not, on the underlying storage, but will be converted to full models when retrieved.

## Embeddable models

Embeddable models are models that don't have a connection thus can't have a collection or table created for it. They are used in conjunction with embedded reference fields when you want referenced items to be embedded on the main document.

Embeddable models can't be used as a standalone model so trying to save a detached item of an embeddable model will trigger errors. Embeddable models don't need a `key` property neither.

```js
server.model('phone', {
  fields: {
    type: 'string',
    number: 'string',
  }
});
```

## Methods and statics

You can use the `statics` and `methods` properties to add methods to the model object or its prototype respectively.

```js
server.model('user', {
  fields: {
    username: 'string',
    password: 'string',
    statics: {
      authenticate: function (username, password, callback) {
        this.get(username, function(error, account) {
          if (error) {
            callback(error);
          }

          callback(null, account && account.checkPassword(password));
        });
      }
    },
    methods: {
      checkPassword: function (password) {
        return this.password == password;
      }
    }
  },
  key: 'username'
});
```

## Mixins

Models can use the `mixins` property to set the models to inherit properties from.

```js
server.model('post', {
  fields: {
    id: 'number',
    title: 'string',
    date: 'string',
  }
});
```

```js
server.model('article', {
  mixins: ['post'],
  fields: {
    image: 'string',
    body: 'string',
  }
});
```

## Abstract models

An abstract model is a model that doesn't have a connection but its main purpose is not to be embeddable, but to be used for declaring a base model or an interface to be used in mixins. Just like the embeddable models, abstract models can't be used standalone.

Abstract models can be used when you need models that share a common set of fields, similar models that persists in different storages, reference fields that references more than one model that share the same abstract model (interface), or models that share the same collection/table on the underlying storage. To accomplish de latter two you can set the `reference` property of the reference field or `name` property of the sub-model to the name of the abstract model respectively.
