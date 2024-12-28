const Router = require('express')
const router = Router();

// department 
const createDepartment = require('../Controller/Department')
router.post('/department',createDepartment.createDepartment)

// Role 
const createRole = require('../Controller/Role')
router.post('/role',createRole.createRole)

// Employee 
const createEmployee = require('../Controller/Employee')
router.post('/employee',createEmployee.createEmployee)




module.exports = router