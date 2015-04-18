# Query

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

## Operators

Operators add more flexibility to criteria by changing how the value is evaluated. Operators can be one of the following:

### Comparison operators

- `$eq` (equal)
- `$ne` (not equal)
- `$lt` (less than)
- `$lte` (less than or equal)
- `$gt` (greater than)
- `$gte` (greater than or equal)
- `$in`
- `$nin` (not in)

### Logical operators

 - `$or`
 - `$and`
 - `$nor`
 - `$not`

### The `$eq` and `$ne` operators

The `$eq` operator is the default operator and matches values that are *equal* (==) the operator value. Just like the `$eq` operator we have the `$ne` with matches values that are *not equal* (!=) the operator value.

```js
Model.list({name: {$eq: 'foo'}});
```

Is the same as:

```js
Model.list({name: 'foo'});
```

### The `$lt`, `$lte`, `$gt` and `$gte` operators

The `$lt`, `$lte`, `$gt` and  `$gte` operators match numeric values that are less than (`$lt`) or greater (`$gt`) than the operator value, allowing the value itself to be included or not on the matched items (`$lte` and `$gte`).

```js
Model.list({points: {$gt: 100}, age: {$gte: 18}});
```

### The `$in` and `$nin` operators

The `$in` operator matches *any* of the values in the given array. Just like the `$in` operator we have the `$nin` with matches *none* of the values in the given array.

```js
Model.list({name: {$in: ['foo', 'bar']}});
```

### The `$or`, `$and` and `$nor` operators

The `$or` operator receives an array of expressions return items that match *one* of the expressions while the `$and` operator return items that match *all* expressions. The `$nor` operator does the inverse of `$or`, i.e. it exclude from the results items that match *one* of the expressions.

```js
Model.list({$or: [{name: 'foo'}, {active: true}]});
```

### The `$not` operator

The `$not` operator inverts the result of the provided expression.

```js
Model.list({points: {$not: {$lt: 100}}});
```
