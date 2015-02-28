# Schema

 > **Disclaimer:** not everything documented here is implemented yet.

Schema provides the metadata for models, it contains information about fields, references and what connection the model will use.

## Field types

Xylem implements the [JSON schema primitive types](http://json-schema.org/latest/json-schema-core.html#anchor8) plus three more field types (date, datetime and reference).

 - string
 - integer
 - number
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
{
  connection: 'memory',
  fields: {
    name: 'string',
    age: 'number'
  },
  key: 'name'
}
```

### Object with field settings:

```js
{
  connection: 'memory',
  fields: {
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
}
```

All field types have the `required` property. The scalar field types `string`, `integer` and `number` have the `index` and `unique` properties. The `reference` field type has the `reference`, `embedded`, `multiple`, `populate` and `via` properties.

**Note:** field definitions are normalized into objects before being used by Xylem and its components.

### Reference fields

References allow declaring the relationship between your models. The extra properties we have for reference fields are:

 - **reference:** set what model this field references to.
 - **embedded:** setup an embedded reference.
 - **multiple:** setup a multiple reference.
 - **via:** set the field that reference this type on the referenced type in a one-to-many relationship.

```js
{
  embedded: true,
  fields: {
    name: 'string',
    phones: {
      type: 'reference',
      reference: 'phone',
      embedded: true,
      multiple: true
    }
  },
  key: 'name'
}
```

Reference fields will use primitive types `array` or `object` whether if it's multiple or not, on the underlying storage, but will be converted to full models when retrieved.

## Embeddable models

Embeddable models are models that don't have a connection thus can't have a collection or table created for it. They are used in conjunction with embedded reference fields when you want referenced items to be embedded on the main document.

Embeddable models can't be used as a standalone model so trying to save an item of a embeddable model will trigger errors. Embeddable models don't need a `key` property neither.

```js
{
  fields: {
    type: 'string',
    number: 'string',
  }
}
```
