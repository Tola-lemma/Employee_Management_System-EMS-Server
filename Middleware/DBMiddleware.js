const db = require('../Database/connection');
const createDepartmentTable = require('../Migrations/DepartmentTable');
const createDepartmentHistoryTable = require('../Migrations/EmployeeDepartmentHistoryTable');
const createEmployeeTable = require('../Migrations/EmployeeTable');
const createRolesTable = require('../Migrations/RolesTable');
const runDBMigration = async ()=>{
      console.log('BEGIN DB MIGRATION');
      const client = await db.connect();
      try {
            await client.query('BEGIN');
            await client.query(createDepartmentTable); 
            await client.query(createRolesTable); 
            await client.query(createEmployeeTable); 
            await client.query(createDepartmentHistoryTable); 
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