const { knex } = require('../../util/db');

// Select admin(s) by filter
exports.select = async (options, tblName) => {
  try {
    const {type='', condition={}, like={}, compare={}, select="*", join=[], skip=0, limit=0, sort=['id','desc']} = options;
    const { $or = [], ...where } = condition;
    const query = knex(tblName);
    if (Object.keys(where).length) {
      query.where(where);
    }

    if (Object.keys(like).length) {
        for (const col in like) {
            query.where(col, 'like', like[col]);
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
    if (compare && Object.keys(compare).length) {
        for (const col in compare) {
            const [op, val] = compare[col];
            query.where(col, op, val);
        }
    }

    if(skip) query.offset(skip);
    if(limit) query.limit(limit);
    if (type === 'count') {
      const [{ count }] = await query.count({ count: '*' });
      return parseInt(count, 10);
    } else if (type === 'single') {
      return await query.first(select);
    } else {
      return await query.select(select).orderBy(sort[0],sort[1]);
    }
  } catch (error) {
    console.log('error : ', error);
  }
}