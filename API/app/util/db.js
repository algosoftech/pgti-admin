// Knex instance for query building and migrations
const knex = require('knex')({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: "",
    database: process.env.DB_NAME || "farmer_db",
    port: process.env.DB_PORT || 3306
  }
});

exports.knex = knex;

const mysql = require('mysql2/promise');

/**
 * Create MySQL DB connection
 * @method
 * @returns {Object} db connection
 */
exports.dbConnection = async function () {
    try {
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST || "localhost",
          user: process.env.DB_USER || "root",
          password: "",
          database: process.env.DB_NAME || "farmer_db",
          port: process.env.DB_PORT || 3306
        });
        // console.log('MySQL connected successfully');
        return connection;
    } catch (error) {
        return Promise.reject(error);
    }
};
