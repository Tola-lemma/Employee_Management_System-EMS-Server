const createTasksTable = `
CREATE TABLE IF NOT EXISTS Tasks (
  task_id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES Employees(employee_id) ON DELETE CASCADE,
  task_description TEXT NOT NULL,
  due_date DATE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed'))
)`;

module.exports = createTasksTable;
