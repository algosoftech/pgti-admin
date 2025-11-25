const { knex } = require('../../util/db');

const TABLE_NAME = 'admin';

// Insert a new admin
async function insertAdmin(data) {
  return await knex(TABLE_NAME).insert(data);
}

// Update an admin by id
async function updateAdmin(options) {
  try {
    const { condition, data } = options;
    await knex(TABLE_NAME).where(condition).update(data);
    return await knex(TABLE_NAME).where(condition).first();
  } catch (error) {
    
  }
}

// Select admin(s) by filter
async function selectAdmins(options) {
  try {
    const {type='', condition={}, select="*", skip='0', limit='10'} = options;
    if(type === 'count'){
      const [{ count }] = await knex(TABLE_NAME).where(condition).count({ count: '*' });
      return parseInt(count, 10);
    } else if(type === 'single'){
       return await knex(TABLE_NAME).where(condition).first(select);
    } else{
      return await knex(TABLE_NAME).where(condition).select(select).offset(skip).limit(limit);
    }
  } catch (error) {
    console.log("error : ", error);
  }
}

async function getUserById(id) {
  try {
    return await knex(TABLE_NAME).where({id : id}).first();
  } catch (error) {
    
  }
}
module.exports = {
  insertAdmin,
  updateAdmin,
  selectAdmins,
  getUserById,
}; 