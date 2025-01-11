const db = require("../Database/connection");

// Create
exports.createTask = async (req, res) => {
  const { employee_id, task_description, due_date, status } = req.body;
  try {
    const query = `
      INSERT INTO Tasks (employee_id, task_description, due_date, status)
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const task = await db.query(query, [employee_id, task_description, due_date, status]);
    res.status(201).json({ message: "Task created successfully!", result: task.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating task.", error: error.message });
  }
};

// Read
exports.getTasks = async (req, res) => {
  const { employee_id } = req.params;
  try {
    const query = employee_id
      ? `
        SELECT t.task_id, t.task_description, t.due_date, t.status,
               e.employee_id, e.first_name || ' ' || e.last_name AS fullName
        FROM Tasks t
        JOIN Employees e ON t.employee_id = e.employee_id
        WHERE t.employee_id = $1`
      : `
        SELECT t.task_id, t.task_description, t.due_date, t.status,
               e.employee_id, e.first_name || ' ' || e.last_name AS fullName
        FROM Tasks t
        JOIN Employees e ON t.employee_id = e.employee_id`;
    const tasks = await db.query(query, employee_id ? [employee_id] : []);
    res.status(200).json({ message: "Tasks fetched successfully!", result: tasks.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tasks.", error: error.message });
  }
};

// Update
exports.updateTask = async (req, res) => {
  const { task_id } = req.params;
  const { task_description, due_date, status } = req.body;
  try {
    const query = `
      UPDATE Tasks
      SET 
        task_description = COALESCE($1, task_description),
        due_date = COALESCE($2, due_date),
        status = COALESCE($3, status)
      WHERE task_id = $4 RETURNING *`;
    const updatedTask = await db.query(query, [task_description, due_date, status, task_id]);
    if (updatedTask.rows.length === 0) {
      return res.status(404).send({ message: "Task not found." });
    }
    res.status(200).json({ message: "Task updated successfully!", result: updatedTask.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating task.", error: error.message });
  }
};

// Delete
exports.deleteTask = async (req, res) => {
  const { task_id } = req.params;
  try {
    const query = `DELETE FROM Tasks WHERE task_id = $1 RETURNING *`;
    const deletedTask = await db.query(query, [task_id]);
    if (deletedTask.rows.length === 0) {
      return res.status(404).send({ message: "Task not found." });
    }
    res.status(200).json({ message: "Task deleted successfully!", result: deletedTask.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting task.", error: error.message });
  }
};
