const createNotificationsTable = `
CREATE TABLE IF NOT EXISTS Notifications (
  notification_id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES Employees(employee_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('alert', 'reminder')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
  updated_at TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE
)`;

module.exports = createNotificationsTable;
