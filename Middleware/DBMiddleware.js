const db = require('../Database/connection');
const createDepartmentTable = require('../Migrations/DepartmentTable');
const createDepartmentHistoryTable = require('../Migrations/EmployeeDepartmentHistoryTable');
const createEmployeeTable = require('../Migrations/EmployeeTable');
const createRolesTable = require('../Migrations/RolesTable');
const createAttendanceTable = require('../Migrations/AttendanceTable');
const createPerformanceTable = require('../Migrations/PerformanceTable');
const createTasksTable = require('../Migrations/TasksTable');
const createNotificationsTable = require('../Migrations/NotificationsTable');
const createAuditTable = require('../Migrations/AuditTable');
const createLeaveTable = require('../Migrations/LeaveTable');
const createGamificationsTable = require('../Migrations/GamificationsTable');


const runDBMigration = async ()=>{
      console.log('BEGIN DB MIGRATION');
      const client = await db.connect();
      try {
            await client.query('BEGIN');
            await client.query(createDepartmentTable); 
            await client.query(createRolesTable); 
            await client.query(createEmployeeTable); 
            await client.query(createDepartmentHistoryTable); 
            await client.query(createAttendanceTable);
            await client.query(createPerformanceTable);
            await client.query(createTasksTable);
            await client.query(createNotificationsTable);
            await client.query(createAuditTable);
            await client.query(createLeaveTable);
            await client.query(createGamificationsTable);
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