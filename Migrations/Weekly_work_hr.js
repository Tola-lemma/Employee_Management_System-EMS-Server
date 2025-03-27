const createWeeklyWorkHr = `CREATE TABLE IF NOT EXISTS weekly_work_hours (
    week_id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
    week_start_date DATE,  -- The starting date of the week (Monday)
    week_number INT NOT NULL,  -- Week number (1, 2, 3, etc.)
    total_work_hours NUMERIC DEFAULT 0,  -- Total work hours for the week
    extra_work_hours NUMERIC DEFAULT 0,  -- Extra work hours for the week
    status VARCHAR(50) CHECK (status IN ('In Progress', 'Completed'))  -- Status of the week (In Progress or Completed)
)`
module.exports = createWeeklyWorkHr