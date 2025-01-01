const createDepartmentsTable = `CREATE TABLE IF NOT EXISTS Departments (
    department_id SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
)`
module.exports = createDepartmentsTable
