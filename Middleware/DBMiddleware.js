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
const Offices = require('../Migrations/Att_Office');
const createAttendanceTableV2 = require('../Migrations/AttendanceV2');
const createWeeklyWorkHr = require('../Migrations/Weekly_work_hr');


const runDBMigration = async ()=>{
      console.log('BEGIN DB MIGRATION');
      const client = await db.connect();

// const alterEmployeeTable = async () => {
//     try {
//         await db.query(`ALTER TABLE Employees ADD COLUMN IF NOT EXISTS office_id INT REFERENCES Offices(office_id) ON DELETE SET NULL`);
//         await db.query(`UPDATE Employees SET office_id = 1`); // Set default office ID to 1 
//        console.log("Alteration successful: office_id column added and updated.");
//     } catch (error) {
//         console.error("Error altering Employees table:", error);
//     }
// };

// alterEmployeeTable();

      try {
            await client.query('BEGIN');
            await client.query(createDepartmentTable); 
            await client.query(createRolesTable); 
            // await client.query(createEmployeeTable); 
            await client.query(createDepartmentHistoryTable); 
            await client.query(createAttendanceTable);
            await client.query(createPerformanceTable);
            await client.query(createTasksTable);
            await client.query(createNotificationsTable);
            await client.query(createAuditTable);
            await client.query(createLeaveTable);
            await client.query(createGamificationsTable);
            await client.query(Offices);
            await client.query(createAttendanceTableV2);
            await client.query(createWeeklyWorkHr);
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