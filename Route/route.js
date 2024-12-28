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
router.post('/employees',employeeController.createEmployee)
router.get("/employees/:employee_id?", employeeController.getEmployee);
router.put("/employees/:employee_id", employeeController.updateEmployee);
router.delete("/employees/:employee_id", employeeController.deleteEmployee);




module.exports = router