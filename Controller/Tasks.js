const db = require("../Database/connection");

// Create
exports.createTask = async (req, res) => {
    const { title, description, assigned_to, due_date, status } = req.body;
    try {
        const query = `
            INSERT INTO Tasks (title, description, employee_id, due_date, status)
            VALUES ($1, $2, $3, $4, $5) RETURNING *`;
        const result = await db.query(query, [title, description, assigned_to, due_date, status]);
        res.status(201).json({
            message: "Task created successfully!",
            result: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Error creating task.",
            error: error.message
        });
    }
};


// Read
exports.getTasks = async (req, res) => {
  const { task_id } = req.params;
  try {
    const query = task_id
      ? `SELECT * FROM Tasks WHERE task_id = $1`
      : `SELECT * FROM Tasks`;
    const tasks = await db.query(query, task_id ? [task_id] : []);
    res.status(200).json({ message: "Tasks fetched successfully!", result: tasks.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching tasks.", error: error.message });
  }
};

// Update
exports.updateTask = async (req, res) => {
  const { task_id } = req.params;
  const { status } = req.body;
  try {
    const query = `
      UPDATE Tasks
      SET status = $1
      WHERE task_id = $2 RETURNING *`;
    const updatedTask = await db.query(query, [status, task_id]);
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
