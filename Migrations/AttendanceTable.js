const createAttendanceTable = `
CREATE TABLE IF NOT EXISTS Attendance (
  attendance_id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES Employees(employee_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'on leave')),
  check_in_time TIME,
  check_out_time TIME
)`;

module.exports = createAttendanceTable;
