# Query

 > **Disclaimer:** this is a working in progress. Not everything documented here is implemented yet and it's subject to change.

## The criteria object

The criteria object is an uniform way to query different databases based on a criteria. The criteria is made of key/value pairs and operators.

### Single key/value pair:

The simplest criteria has a single key/value pair and will match the exact value for a field.

```js
Model.list({name: 'foo'});
```

### Multiple key/value pairs:

A criteria can have multiple key/value pairs that allow narrowing results by ensuring one *and* the other value has a specific value.

```js
Model.list({name: 'foo', active: true});
```

### Find matching from a list:

Values can also be a list of values to allow to search for one *or* the other value.

```js
Model.list({name: ['foo', 'bar']});
```

## Operators

Operators add more flexibility to criteria by changing how the value is evaluated. Operators can be one of the following:

### Logical operators

 - `or`
 - `not`

### String comparison operators

 - `contains`
 - `startsWith`
 - `endsWith`

### Numeric comparison operators

 - `lessThan`
 - `lessThanOrEqual`
 - `greaterThan`
 - `greaterThanOrEqual`


### The `or` operator

The `or` operator receives a query and makes it matches one *or* the other values instead of *and* as it does by default.

```js
Model.list({or: {name: 'foo', active: true}});
```

### The `not` operator

The `not` operator receives a query and return its reverse. I.e. everything it matches will be filtered out.

```js
Model.list({not: {name: 'foo'}});
```

For convenience you can also use the `not` operator on field values.

```js
Model.list({name: {not: 'foo'}});
```

Both examples above should have the same results but the latter may be more optimized depending on the adapter implementation.

### The `contains` operator

The `contains` operator allows searching for a string within another and will match values that contains the string in any position.

```js
Model.list({name: {contains: 'foo'}});
```

### The `startsWith` operator

The `startsWith` operator allows searching for a string within another and will match values that start with the string.

```js
Model.list({name: {startsWith: 'foo'}});
```

### The `endsWith` operator

The `endsWith` operator allows searching for a string within another and will match values that end with the string.

```js
Model.list({name: {endsWith: 'foo'}});
```

### The `lessThan`, `lessThanOrEqual`, `greaterThan` and `greaterThanOrEqual` operators

The `lessThan`, `lessThanOrEqual`, `greaterThan` and  `greaterThanOrEqual` operators allows matching numeric values that are less than or greater than the operator value, allowing the value itself to be included or not on the matched items.

```js
Model.list({points: {greaterThan: 100}, age: {greatherThanOrEqual: 18}});
```

### Reserved words (field names)

Due to operators being standard object properties, no field can be named the same as any of the nine operators (`or`, `not`, `contains`, `startsWith`, `endsWith`, `lessThan`, `lessThanOrEqual`, `greaterThan`, `greaterThanOrEqual`).

## FAQ

### Why object notation instead of chained methods for building the query?

The short answer for this, is for queries to be portable i.e. this way they can live in JSON files or even be sent as query string or the HTTP POST body.
