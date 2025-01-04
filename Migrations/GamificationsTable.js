const createGamificationsTable = `
CREATE TABLE IF NOT EXISTS Gamifications (
    gamification_id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES Employees(employee_id) ON DELETE CASCADE,
    points INT NOT NULL,
    level VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
`;
module.exports = createGamificationsTable;
