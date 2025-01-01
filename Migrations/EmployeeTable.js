const createEmployeeTable =`CREATE TABLE IF NOT EXISTS Employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department_id INT REFERENCES Departments(department_id) ON DELETE SET NULL,
    role_id INT REFERENCES Roles(role_id) ON DELETE SET NULL,
    date_of_birth DATE,
    address TEXT,
    date_joined DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    password VARCHAR(255) NOT NULL,
    bad_login_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    must_change_password BOOLEAN DEFAULT TRUE,
    profile_picture BYTEA
)`
module.exports = createEmployeeTable;
