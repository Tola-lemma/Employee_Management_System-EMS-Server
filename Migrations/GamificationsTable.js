const createGamificationsTable = `CREATE TABLE IF NOT EXISTS Gamification (
    gamification_id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES Employees(employee_id) ON DELETE CASCADE,
    points INT NOT NULL DEFAULT 0,
    level VARCHAR(50) NOT NULL DEFAULT 'Beginner',
    badges JSONB DEFAULT '[]', 
    streak INT DEFAULT 0, 
    last_active TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

`;
module.exports = createGamificationsTable;
