const createDepartmentHistoryTable = `
CREATE TABLE IF NOT EXISTS EmployeeDepartmentHistory (
    history_id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES Employees(employee_id) ON DELETE CASCADE,
    department_id INT REFERENCES Departments(department_id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE
);

`
module.exports = createDepartmentHistoryTable