const { knex } = require('../../util/db');

/**
 * Inserts a new record into a table and returns the created record
 * @param {Object} data - Column-value pairs to insert
 * @param {String} tblName - Name of the table
 * @param {Object} [trx=null] - Optional Knex transaction object
 * @returns {Promise<Object>} The newly created record
 * @example
 * const user = await insert({ name: 'John', email: 'john@example.com' }, 'users');
 */
exports.insert = async (data, tblName, trx = null) => {
  const query = trx ? trx(tblName) : knex(tblName);
  const [insertId] = await query.insert(data);
  return await knex(tblName).where('id', insertId).first();
};

/**
 * Updates records in a table based on conditions and returns updated records
 * @param {Object} options - Update configuration
 * @param {Object} options.condition - Where clause conditions (e.g., { id: 1 })
 * @param {Object} options.data - Column-value pairs to update
 * @param {String} tblName - Name of the table
 * @param {Object} [trx=null] - Optional Knex transaction object
 * @returns {Promise<Object>} Query builder for updated records
 * @example
 * await update({ condition: { id: 1 }, data: { name: 'Jane' } }, 'users');
 */
exports.update = async (options, tblName, trx = null) => {
  try {
    const { condition, data } = options;
    // console.log()
    const query = trx ? trx(tblName) : knex(tblName);
    const query2 = trx ? trx(tblName) : knex(tblName);
     await query.where(condition).update(data);
     return query2.where(condition).select('*');
  } catch (error) {
    console.log('error : ', error);
  }
}

/**
 * Deletes records from a table based on conditions
 * @param {Object} condition - Where clause conditions (e.g., { id: 1 })
 * @param {String} tblName - Name of the table
 * @returns {Promise<Number>} Number of deleted rows
 * @throws {Error} If condition is empty
 * @example
 * const count = await delete({ id: 1 }, 'users');
 */
exports.delete = async (condition, tblName) => {
  if (!condition || Object.keys(condition).length === 0) {
    throw new Error("Delete condition cannot be empty");
  }
  return await knex(tblName).where(condition).del();
}

/**
 * Advanced delete function supporting both simple conditions and whereIn clauses
 * @param {Object} options - Delete configuration
 * @param {Object} [options.condition={}] - Simple where conditions
 * @param {Object} [options.whereIn={}] - WHERE IN conditions (e.g., { id: [1, 2, 3] })
 * @param {String} tblName - Name of the table
 * @returns {Promise<Number>} Number of deleted rows
 * @throws {Error} If both condition and whereIn are empty
 * @example
 * await deleteByCondition({ whereIn: { id: [1, 2, 3] } }, 'users');
 */
exports.deleteByCondition = async (options, tblName) => {
  const {condition={}, whereIn={}} = options;
  if ((!condition || Object.keys(condition).length === 0) && (!whereIn || Object.keys(whereIn).length === 0)) {
    throw new Error("Delete condition cannot be empty");
  }

  const hasCondition = condition && Object.keys(condition).length > 0;
  const hasWhereIn = whereIn && Object.keys(whereIn).length > 0;

  if (!hasCondition && !hasWhereIn) {
    throw new Error(`⚠️ Skipped DELETE on '${tblName}' because no condition was provided.`);
    // return { success: false, message: "Delete condition cannot be empty" };
  }

  const query = knex(tblName);

  // Apply simple where conditions
  if (condition && Object.keys(condition).length > 0) {
    query.where(condition);
  }

  // Apply whereIn conditions
  if (whereIn && Object.keys(whereIn).length > 0) {
    for (const [column, values] of Object.entries(whereIn)) {
      if (Array.isArray(values) && values.length > 0) {
        query.whereIn(column, values);
      }
    }
  }

  return await query.del();
};

/**
 * Powerful query builder supporting complex SELECT operations
 * @param {Object} options - Query configuration
 * @param {String} [options.type=''] - Query type: 'single' (first record), 'count' (count only), or '' (array)
 * @param {Object} [options.condition={}] - Where conditions. Supports $or key for OR conditions
 * @param {Object} [options.like={}] - LIKE conditions (e.g., { name: '%john%' })
 * @param {Object} [options.compare={}] - Comparison operators (e.g., { age: ['>', 18] })
 * @param {String|Array} [options.select='*'] - Columns to select
 * @param {Array} [options.join=[]] - Join configurations [{ table, type, on: [col1, op, col2] }]
 * @param {Number} [options.skip=0] - Pagination offset
 * @param {Number} [options.limit=0] - Maximum records to return
 * @param {Array} [options.sort=['id','desc']] - Sort order [column, direction]
 * @param {Array} [options.groupBy=[]] - Columns to group by
 * @param {Object} [options.whereIn={}] - WHERE IN conditions (e.g., { id: [1, 2, 3] })
 * @param {Object} [options.between={}] - BETWEEN conditions (e.g., { created_at: ['2024-01-01', '2024-12-31'] })
 * @param {String} tblName - Name of the table
 * @param {Object} [trx=null] - Optional Knex transaction object
 * @returns {Promise<Array|Object|Number>} Records array, single record, or count depending on type
 * @example
 * const users = await select({ condition: { status: 'active' }, limit: 10 }, 'users');
 */
exports.select = async (options, tblName, trx = null) => {
  try {
    const {type='', condition={}, like={}, compare={}, select="*", join=[], skip=0, limit=0, sort=['id','desc'], groupBy = [], whereIn = {}, between = {}} = options;
    const { $or = [], ...where } = condition;
    const query = trx ? trx(tblName) : knex(tblName);
    if (type !== 'single') query.select(select);
    if (Object.keys(where).length) {
      query.where(where);
    }

    if (Object.keys(whereIn).length) {
      for (const col in whereIn) {
        if (Array.isArray(whereIn[col]) && whereIn[col].length > 0) {
          query.whereIn(col, whereIn[col]);
        }
      }
    }

    if (Object.keys(like).length) {
        for (const col in like) {
            query.where(col, 'like', like[col]);
        }
    }

    if (compare && Object.keys(compare).length) {
        for (const col in compare) {
            const [op, val] = compare[col];
            query.where(col, op, val);
        }
    }

    //Apply in between range
    if (Object.keys(between).length) {
      for (const col in between) {
        const [start, end] = between[col];
        if (start && end) {
          query.whereBetween(col, [start, end]);
        }
      }
    }

    // Apply joins
    if (Array.isArray(join)) {
      join.forEach(j => {
        const [col1, operator, col2] = j.on;
        const joinMethod = j.type || 'inner';
        query[joinMethod + 'Join'](j.table, col1, operator, col2);
      });
    }

    // Apply $or conditions
    if (Array.isArray($or) && $or.length > 0) {
      query.andWhere(function () {
        $or.forEach((orCond) => {
          this.orWhere(orCond);
        });
      });
    }

    if (Array.isArray(groupBy) && groupBy.length > 0) {
      query.groupBy(groupBy);
    }
    if(skip) query.offset(skip);
    if(limit) query.limit(limit);
    // console.log(query.toString());
    if (type === 'count') {
      const [{ count }] = await query.count({ count: '*' });
      return parseInt(count, 10);
    } else if (type === 'single') {
      return await query.first(select);
    } else {
      return await query.orderBy(sort[0],sort[1]);
    }
  } catch (error) {
    console.log('error : ', error);
  }
}

/**
 * Retrieves a single user record by ID from the users table
 * @param {String|Number} [id=''] - User ID to search for
 * @returns {Promise<Object|undefined>} User record if found, undefined otherwise
 * @example
 * const user = await getUsersById(1);
 */
exports.getUsersById = async (id='') => {
    try {
      return await knex('users').where({id : id}).first();
    } catch (error) {
      
    }
}