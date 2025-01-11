const Router = require('express')
const router = Router();
const AuthMiddleware = require('../Middleware/AuthMiddleware')
// department 
const departmentController = require('../Controller/Department')
router.post('/departments', departmentController.createDepartment)
router.get('/departments/:department_id?',AuthMiddleware, departmentController.getDepartments) //get all departments or a specific department
router.put('/departments/:department_id',AuthMiddleware, departmentController.updateDepartment)
router.delete('/departments/:department_id',AuthMiddleware, departmentController.deleteDepartment)
// Role 
const roleController = require('../Controller/Role')
router.post('/roles',roleController.createRole)
router.get('/roles/:role_id?',AuthMiddleware,roleController.getRoles)
router.put('/roles/:role_id',AuthMiddleware,roleController.updateRole)
router.delete('/roles/:role_id',AuthMiddleware,roleController.deleteRole)

// Employee 
const employeeController = require('../Controller/Employee')
const EmpDepartHistory = require('../Controller/EmpDepartHistory')
router.post('/employees',employeeController.createEmployee)
router.get("/employees/:employee_id?",AuthMiddleware, employeeController.getEmployee);
router.put("/employees/:employee_id",AuthMiddleware, employeeController.updateEmployee);
router.delete("/employees/:employee_id",AuthMiddleware, employeeController.deleteEmployee);
router.get("/employees/department-history/:employee_id",AuthMiddleware, EmpDepartHistory.getEmployeeDepartmentHistory);

//Attendance
const attendanceController = require("../Controller/Attendance");
router.post("/attendance",AuthMiddleware, attendanceController.createAttendance);
router.get("/attendance/:attendance_id?",AuthMiddleware, attendanceController.getAttendance);
router.put("/attendance/:attendance_id",AuthMiddleware, attendanceController.updateAttendance);
router.delete("/attendance/:attendance_id",AuthMiddleware, attendanceController.deleteAttendance);
//Performance
const performanceController = require("../Controller/Performance");
router.post("/performance",AuthMiddleware, performanceController.createPerformance);
router.get("/performance/:performance_id?",AuthMiddleware, performanceController.getPerformance);
router.put("/performance/:performance_id",AuthMiddleware, performanceController.updatePerformance);
router.delete("/performance/:performance_id",AuthMiddleware, performanceController.deletePerformance);
//Tasks
const tasksController = require("../Controller/Tasks");
router.post("/tasks",AuthMiddleware, tasksController.createTask);
router.get("/tasks/:employee_id?",AuthMiddleware, tasksController.getTasks);
router.put("/tasks/:task_id", AuthMiddleware,tasksController.updateTask);
router.delete("/tasks/:task_id",AuthMiddleware,tasksController.deleteTask);
//Notifications
const notificationsController = require("../Controller/Notifications");
router.post("/notifications",AuthMiddleware, notificationsController.createNotification);
router.get("/notifications/:employee_id?",AuthMiddleware, notificationsController.getNotifications);
router.put("/notifications/:notification_id",AuthMiddleware, notificationsController.markNotificationAsRead);
router.delete("/notifications/:notification_id",AuthMiddleware, notificationsController.deleteNotification);
// Audit
const auditController = require('../Controller/Audit');
router.post('/audit', auditController.createAuditLog);
router.get('/audit/:audit_id?', auditController.getAuditLogs);
router.delete('/audit/:audit_id', auditController.deleteAuditLog);

// Leave
const leaveController = require('../Controller/Leave');
router.post('/leave',AuthMiddleware, leaveController.createLeaveRequest);
router.get('/leave/:leave_id?',AuthMiddleware, leaveController.getLeaveRequests);
router.put('/leave/:leave_id',AuthMiddleware, leaveController.updateLeaveRequest);
router.delete('/leave/:leave_id',AuthMiddleware, leaveController.deleteLeaveRequest);

// Gamifications
const gamificationsController = require('../Controller/Gamifications');
router.post('/gamifications', gamificationsController.createGamification);
router.get('/gamifications/:gamification_id?', gamificationsController.getGamifications);
router.put('/gamifications/:gamification_id', gamificationsController.updateGamification);
router.delete('/gamifications/:gamification_id', gamificationsController.deleteGamification);

//Auth
const authController = require('../Controller/Auth/Login')
const passwordReset = require('../Controller/Auth/PasswordReset');
const changePassword  = require('../Controller/Auth/ChangePassword');
const { getEmployeeDepartmentHistory } = require('../Controller/EmpDepartHistory');
router.post('/login',authController.loginEmployee)
router.post('/password-reset/:employee_id',passwordReset.resetPassword)
router.put('/change-password/:employee_id',changePassword.changePassword)

module.exports = router
