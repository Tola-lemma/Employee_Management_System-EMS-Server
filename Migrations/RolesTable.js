const createRolesTable = `CREATE TABLE IF NOT EXISTS Roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
)`
module.exports = createRolesTable