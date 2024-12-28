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
router.post('/role',roleController.createRole)

// Employee 
const employeeController = require('../Controller/Employee')
router.post('/employee',employeeController.createEmployee)




module.exports = router