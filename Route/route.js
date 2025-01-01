const Router = require('express')
const router = Router();

// department 
const departmentController = require('../Controller/Department')
router.post('/departments', departmentController.createDepartment)
router.get('/departments/:department_id?', departmentController.getDepartments) //get all departments or a specific department
router.put('/departments/:department_id', departmentController.updateDepartment)
router.delete('/departments/:department_id',departmentController.deleteDepartment)
// Role 
const roleController = require('../Controller/Role')
router.post('/roles',roleController.createRole)
router.get('/roles/:role_id?',roleController.getRoles)
router.put('/roles/:role_id',roleController.updateRole)
router.delete('/roles/:role_id',roleController.deleteRole)

// Employee 
const employeeController = require('../Controller/Employee')
const EmpDepartHistory = require('../Controller/EmpDepartHistory')
router.post('/employees',employeeController.createEmployee)
router.get("/employees/:employee_id?", employeeController.getEmployee);
router.put("/employees/:employee_id", employeeController.updateEmployee);
router.delete("/employees/:employee_id", employeeController.deleteEmployee);
router.get("/employees/department-history/:employee_id", EmpDepartHistory.getEmployeeDepartmentHistory);

//Attendance
const attendanceController = require("../Controller/Attendance");
router.post("/attendance", attendanceController.createAttendance);
router.get("/attendance/:attendance_id?", attendanceController.getAttendance);
router.put("/attendance/:attendance_id", attendanceController.updateAttendance);
router.delete("/attendance/:attendance_id", attendanceController.deleteAttendance);
//Performance
const performanceController = require("../Controller/Performance");
router.post("/performance", performanceController.createPerformance);
router.get("/performance/:performance_id?", performanceController.getPerformance);
router.put("/performance/:performance_id", performanceController.updatePerformance);
router.delete("/performance/:performance_id", performanceController.deletePerformance);
//Tasks
const tasksController = require("../Controller/Tasks");
router.post("/tasks", tasksController.createTask);
router.get("/tasks/:task_id?", tasksController.getTasks);
router.put("/tasks/:task_id", tasksController.updateTask);
router.delete("/tasks/:task_id", tasksController.deleteTask);
//Notifications
const notificationsController = require("../Controller/Notifications");
router.post("/notifications", notificationsController.createNotification);
router.get("/notifications/:notification_id?", notificationsController.getNotifications);
router.put("/notifications/:notification_id", notificationsController.markNotificationAsRead);
router.delete("/notifications/:notification_id", notificationsController.deleteNotification);
//Auth
const authController = require('../Controller/Auth/Login')
const passwordReset = require('../Controller/Auth/PasswordReset');
const changePassword  = require('../Controller/Auth/ChangePassword');
const { getEmployeeDepartmentHistory } = require('../Controller/EmpDepartHistory');
router.post('/login',authController.loginEmployee)
router.post('/password-reset/:employee_id',passwordReset.resetPassword)
router.put('/change-password/:employee_id',changePassword.changePassword)

module.exports = router
