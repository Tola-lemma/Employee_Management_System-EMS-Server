const createAttendanceTableV2 =  `CREATE TABLE IF NOT EXISTS  attendancetwo (
    at_id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES Employees(employee_id) ON DELETE CASCADE,
    office_id INT NOT NULL REFERENCES offices(office_id) ON DELETE CASCADE,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    extra_hours NUMERIC DEFAULT 0,
    status VARCHAR(50) CHECK (status IN ('On Time', 'Late', 'Extra Time')),
    is_checked_in BOOLEAN DEFAULT FALSE
)`
module.exports = createAttendanceTableV2