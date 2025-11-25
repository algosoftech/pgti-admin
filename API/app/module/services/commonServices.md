# Common Services Documentation

## Overview

The `commonServices.js` module provides a set of reusable database operations built on top of Knex.js. It offers a simplified interface for common CRUD operations (Create, Read, Update, Delete) with support for transactions, complex queries, joins, and various filtering options.

---

## Table of Contents

1. [insert](#insert)
2. [update](#update)
3. [delete](#delete)
4. [deleteByCondition](#deletebycondition)
5. [select](#select)
6. [getUsersById](#getusersbyid)

---

## Functions

### insert

Inserts a new record into a table and returns the created record.

#### Parameters

- `data` (Object): An object containing the column-value pairs to insert
- `tblName` (String): The name of the table to insert into
- `trx` (Transaction, optional): Knex transaction object for atomic operations

#### Returns

- `Promise<Object>`: The newly created record with all fields

#### Use Cases

- Creating new records in any table
- User registration
- Adding new products, orders, or any entity
- Batch operations within transactions

#### Examples

```javascript
const commonServices = require('./commonServices');

// Basic insert
const newUser = await commonServices.insert(
  { name: 'John Doe', email: 'john@example.com', role: 'user' },
  'users'
);

// Insert with transaction
const trx = await knex.transaction();
try {
  const newOrder = await commonServices.insert(
    { user_id: 1, total: 100.50, status: 'pending' },
    'orders',
    trx
  );
  await trx.commit();
} catch (error) {
  await trx.rollback();
}
```

---

### update

Updates records in a table based on specified conditions and returns the updated records.

#### Parameters

- `options` (Object): Configuration object containing:
  - `condition` (Object): Where clause conditions (e.g., `{ id: 1 }` or `{ status: 'active' }`)
  - `data` (Object): Column-value pairs to update
- `tblName` (String): The name of the table to update
- `trx` (Transaction, optional): Knex transaction object for atomic operations

#### Returns

- `Promise<Array>`: Query builder for the updated records (use `.then()` or `await` to get results)

#### Use Cases

- Updating user profiles
- Changing order status
- Activating/deactivating records
- Bulk updates with conditions
- Updating records within transactions

#### Examples

```javascript
// Update single record by ID
const updated = await commonServices.update(
  {
    condition: { id: 1 },
    data: { name: 'Jane Doe', email: 'jane@example.com' }
  },
  'users'
);

// Update multiple records by condition
const activated = await commonServices.update(
  {
    condition: { status: 'pending' },
    data: { status: 'active', updated_at: new Date() }
  },
  'orders'
);

// Update with transaction
const trx = await knex.transaction();
try {
  await commonServices.update(
    { condition: { id: 1 }, data: { balance: 500 } },
    'accounts',
    trx
  );
  await trx.commit();
} catch (error) {
  await trx.rollback();
}
```

#### Notes

- The function returns a query builder, so you may need to await it or use `.then()` to get the actual results
- Errors are logged to console but not thrown

---

### delete

Deletes records from a table based on specified conditions.

#### Parameters

- `condition` (Object): Where clause conditions (e.g., `{ id: 1 }` or `{ status: 'inactive' }`)
- `tblName` (String): The name of the table to delete from

#### Returns

- `Promise<Number>`: The number of deleted rows

#### Throws

- `Error`: If condition is empty or not provided

#### Use Cases

- Deleting a single record by ID
- Removing records by status
- Cleaning up old/inactive records
- Soft delete operations (when combined with update)

#### Examples

```javascript
// Delete single record
const deletedCount = await commonServices.delete(
  { id: 5 },
  'users'
);

// Delete by condition
const removedCount = await commonServices.delete(
  { status: 'deleted', archived: true },
  'orders'
);

// Error handling
try {
  await commonServices.delete({}, 'users'); // Will throw error
} catch (error) {
  console.error('Delete failed:', error.message);
}
```

#### Notes

- **Safety**: Always ensure conditions are specific to avoid accidental mass deletions
- The function throws an error if no condition is provided

---

### deleteByCondition

Advanced delete function that supports both simple conditions and `whereIn` clauses for bulk deletions.

#### Parameters

- `options` (Object): Configuration object containing:
  - `condition` (Object, optional): Simple where clause conditions
  - `whereIn` (Object, optional): Object with column names as keys and arrays of values (e.g., `{ id: [1, 2, 3] }`)
- `tblName` (String): The name of the table to delete from

#### Returns

- `Promise<Number>`: The number of deleted rows

#### Throws

- `Error`: If both condition and whereIn are empty

#### Use Cases

- Deleting multiple records by a list of IDs
- Bulk deletion based on multiple criteria
- Removing records matching specific values in a column
- Complex deletion scenarios

#### Examples

```javascript
// Delete using whereIn
const deletedCount = await commonServices.deleteByCondition(
  {
    whereIn: { id: [1, 2, 3, 4, 5] }
  },
  'users'
);

// Delete using simple condition
const removedCount = await commonServices.deleteByCondition(
  {
    condition: { status: 'expired' }
  },
  'sessions'
);

// Delete using both condition and whereIn
const bulkDeleted = await commonServices.deleteByCondition(
  {
    condition: { type: 'temporary' },
    whereIn: { user_id: [10, 20, 30] }
  },
  'notifications'
);

// Error handling
try {
  await commonServices.deleteByCondition({}, 'users'); // Will throw error
} catch (error) {
  console.error('Delete failed:', error.message);
}
```

#### Notes

- At least one of `condition` or `whereIn` must be provided
- `whereIn` values must be arrays with at least one element
- More flexible than `delete()` for complex deletion scenarios

---

### select

A powerful query builder function that supports complex SELECT operations with filtering, joins, pagination, sorting, and more.

#### Parameters

- `options` (Object): Configuration object with the following properties:
  - `type` (String, optional): Query type - `'single'` (returns first record), `'count'` (returns count), or empty (returns array). Default: `''`
  - `condition` (Object, optional): Simple where conditions. Supports `$or` key for OR conditions
  - `like` (Object, optional): LIKE conditions (e.g., `{ name: '%john%' }`)
  - `compare` (Object, optional): Comparison operators (e.g., `{ age: ['>', 18] }`)
  - `select` (String|Array, optional): Columns to select. Default: `'*'`
  - `join` (Array, optional): Array of join objects
  - `skip` (Number, optional): Number of records to skip (pagination offset). Default: `0`
  - `limit` (Number, optional): Maximum number of records to return. Default: `0`
  - `sort` (Array, optional): Sort order `[column, direction]`. Default: `['id', 'desc']`
  - `groupBy` (Array, optional): Columns to group by
  - `whereIn` (Object, optional): WHERE IN conditions (e.g., `{ id: [1, 2, 3] }`)
  - `between` (Object, optional): BETWEEN conditions (e.g., `{ created_at: ['2024-01-01', '2024-12-31'] }`)
- `tblName` (String): The name of the table to query
- `trx` (Transaction, optional): Knex transaction object

#### Returns

- `Promise<Array>`: Array of records (default)
- `Promise<Object>`: Single record if `type === 'single'`
- `Promise<Number>`: Count if `type === 'count'`

#### Use Cases

- Fetching all records with filters
- Pagination
- Search functionality
- Complex queries with joins
- Aggregations with groupBy
- Counting records
- Date range queries
- OR condition queries

#### Examples

```javascript
// Basic select - get all records
const allUsers = await commonServices.select(
  {},
  'users'
);

// Select with conditions
const activeUsers = await commonServices.select(
  {
    condition: { status: 'active', role: 'user' }
  },
  'users'
);

// Select single record
const user = await commonServices.select(
  {
    type: 'single',
    condition: { id: 1 }
  },
  'users'
);

// Select with LIKE (search)
const searchResults = await commonServices.select(
  {
    like: { name: '%john%', email: '%@gmail.com' }
  },
  'users'
);

// Select with comparison operators
const adults = await commonServices.select(
  {
    compare: {
      age: ['>=', 18],
      balance: ['>', 0]
    }
  },
  'users'
);

// Select with WHERE IN
const specificUsers = await commonServices.select(
  {
    whereIn: { id: [1, 2, 3, 4, 5] }
  },
  'users'
);

// Select with date range (BETWEEN)
const recentOrders = await commonServices.select(
  {
    condition: { status: 'completed' },
    between: {
      created_at: ['2024-01-01', '2024-12-31']
    }
  },
  'orders'
);

// Select with OR conditions
const users = await commonServices.select(
  {
    condition: {
      status: 'active',
      $or: [
        { role: 'admin' },
        { role: 'moderator' }
      ]
    }
  },
  'users'
);

// Select with JOIN
const ordersWithUsers = await commonServices.select(
  {
    select: ['orders.*', 'users.name', 'users.email'],
    join: [
      {
        table: 'users',
        type: 'inner',
        on: ['orders.user_id', '=', 'users.id']
      }
    ]
  },
  'orders'
);

// Pagination
const paginatedUsers = await commonServices.select(
  {
    condition: { status: 'active' },
    skip: 20,  // Skip first 20 records
    limit: 10, // Return 10 records
    sort: ['created_at', 'desc']
  },
  'users'
);

// Count records
const userCount = await commonServices.select(
  {
    type: 'count',
    condition: { status: 'active' }
  },
  'users'
);

// Group by with aggregation
const ordersByStatus = await commonServices.select(
  {
    select: ['status', knex.raw('COUNT(*) as count')],
    groupBy: ['status']
  },
  'orders'
);

// Complex query combining multiple features
const complexQuery = await commonServices.select(
  {
    select: ['orders.*', 'users.name'],
    condition: { 'orders.status': 'pending' },
    like: { 'users.name': '%john%' },
    between: {
      'orders.created_at': ['2024-01-01', '2024-12-31']
    },
    join: [
      {
        table: 'users',
        type: 'inner',
        on: ['orders.user_id', '=', 'users.id']
      }
    ],
    skip: 0,
    limit: 20,
    sort: ['orders.created_at', 'desc']
  },
  'orders'
);
```

#### Notes

- Errors are logged to console but not thrown
- When `type === 'single'`, the `select` parameter is used in `.first()` instead of `.select()`
- Join syntax: `{ table: 'tableName', type: 'inner'|'left'|'right', on: ['col1', '=', 'col2'] }`
- Comparison operators: `'='`, `'!='`, `'>'`, `'>='`, `'<'`, `'<='`, `'<>'`

---

### getUsersById

Retrieves a single user record by ID from the `users` table.

#### Parameters

- `id` (String|Number, optional): The user ID to search for. Default: `''`

#### Returns

- `Promise<Object|undefined>`: The user record if found, `undefined` otherwise

#### Use Cases

- Fetching user details by ID
- User profile retrieval
- Authentication/authorization checks
- User lookup operations

#### Examples

```javascript
// Get user by ID
const user = await commonServices.getUsersById(1);

if (user) {
  console.log('User found:', user.name);
} else {
  console.log('User not found');
}

// In authentication middleware
const userId = req.params.id;
const user = await commonServices.getUsersById(userId);
if (!user) {
  return res.status(404).json({ error: 'User not found' });
}
```

#### Notes

- Errors are silently caught (empty catch block)
- Returns `undefined` if user is not found or if an error occurs
- Consider adding error handling or logging in production

---

## Transaction Support

Several functions support transactions (`trx` parameter) for atomic operations:

- `insert`
- `update`
- `select`

### Transaction Example

```javascript
const trx = await knex.transaction();

try {
  // Insert user
  const user = await commonServices.insert(
    { name: 'John', email: 'john@example.com' },
    'users',
    trx
  );

  // Insert order for that user
  const order = await commonServices.insert(
    { user_id: user.id, total: 100 },
    'orders',
    trx
  );

  // Update user balance
  await commonServices.update(
    { condition: { id: user.id }, data: { balance: 1000 } },
    'users',
    trx
  );

  // Commit transaction
  await trx.commit();
  console.log('Transaction successful');
} catch (error) {
  // Rollback on error
  await trx.rollback();
  console.error('Transaction failed:', error);
}
```

---

## Error Handling

### Functions that throw errors:
- `delete`: Throws error if condition is empty
- `deleteByCondition`: Throws error if both condition and whereIn are empty

### Functions that log errors:
- `update`: Logs errors to console
- `select`: Logs errors to console
- `getUsersById`: Silently catches errors (consider improving)

### Best Practices

1. Always wrap database operations in try-catch blocks
2. Validate input parameters before calling functions
3. Use transactions for multi-step operations
4. Check return values (especially for `getUsersById`)
5. Consider adding proper error handling to functions that currently only log errors

---

## Common Patterns

### Pattern 1: Create and Return
```javascript
const newRecord = await commonServices.insert(data, 'tableName');
```

### Pattern 2: Update and Verify
```javascript
await commonServices.update(
  { condition: { id: 1 }, data: { status: 'active' } },
  'tableName'
);
const updated = await commonServices.select(
  { type: 'single', condition: { id: 1 } },
  'tableName'
);
```

### Pattern 3: Paginated List
```javascript
const page = 1;
const pageSize = 10;
const records = await commonServices.select(
  {
    condition: { status: 'active' },
    skip: (page - 1) * pageSize,
    limit: pageSize,
    sort: ['created_at', 'desc']
  },
  'tableName'
);
```

### Pattern 4: Search with Multiple Criteria
```javascript
const results = await commonServices.select(
  {
    condition: { category: 'electronics' },
    like: { name: '%laptop%' },
    compare: { price: ['<=', 1000] },
    between: { created_at: ['2024-01-01', '2024-12-31'] },
    sort: ['price', 'asc']
  },
  'products'
);
```

---

## Notes

- All functions are async and return Promises
- The service uses Knex.js query builder
- Table names should match your database schema exactly
- For production use, consider adding:
  - Input validation
  - Better error handling
  - Logging
  - Type checking (TypeScript or JSDoc)
  - Unit tests

