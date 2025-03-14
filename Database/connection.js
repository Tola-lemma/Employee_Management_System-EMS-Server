const pg = require('pg');
require('dotenv').config();
const db = new pg.Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl:{
            require:false,
            rejectUnauthorized:false,
      }
})
module.exports = db;