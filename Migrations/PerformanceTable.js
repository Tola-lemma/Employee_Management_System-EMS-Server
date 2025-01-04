const createPerformanceTable = `
CREATE TABLE IF NOT EXISTS Performance (
  performance_id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES Employees(employee_id) ON DELETE CASCADE,
  review_date DATE NOT NULL,
  score INT CHECK (score >= 0 AND score <= 100),
  feedback TEXT
)`;

module.exports = createPerformanceTable;
