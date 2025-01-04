const createAuditTable = `
CREATE TABLE IF NOT EXISTS Audit (
    audit_id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES Employees(employee_id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    details TEXT
);
`;
module.exports = createAuditTable;
