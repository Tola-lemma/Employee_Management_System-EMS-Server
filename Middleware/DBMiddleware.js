const db = require('../Database/connection');
// const createEmployeeTable = require('../../...')
const runDBMigration = async ()=>{
      console.log('BEGIN DB MIGRATION');
      const client = await db.connect();
      try {
            await client.query('BEGIN');
            // await client.query(createEmployeeTable); //Example like this
            await client.query('COMMIT');

            console.log("END MIGRATION");
      } catch (e) {
            await client.query('ROLLBACK')
            console.error('Migration failed:', e.message);
      }finally{
      client.release();
      }
}
module.exports =runDBMigration;