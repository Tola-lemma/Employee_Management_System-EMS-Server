const db = require("../Database/connection");

// Create
exports.createPerformance = async (req, res) => {
  const { employee_id, review_date, score, feedback } = req.body;
  try {
    const query = `
      INSERT INTO Performance (employee_id, review_date, score, feedback)
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const performance = await db.query(query, [employee_id, review_date, score, feedback]);
    res.status(201).json({ message: "Performance record created successfully!", result: performance.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating performance record.", error: error.message });
  }
};

// Read
exports.getPerformance = async (req, res) => {
  const { performance_id } = req.params;
  try {
    const query = performance_id
      ? `SELECT * FROM Performance WHERE performance_id = $1`
      : `SELECT * FROM Performance`;
    const performance = await db.query(query, performance_id ? [performance_id] : []);
    res.status(200).json({ message: "Performance fetched successfully!", result: performance.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching performance records.", error: error.message });
  }
};

// Update
exports.updatePerformance = async (req, res) => {
  const { performance_id } = req.params;
  const { score, feedback } = req.body;
  try {
    const query = `
      UPDATE Performance
      SET score = $1, feedback = $2
      WHERE performance_id = $3 RETURNING *`;
    const updatedPerformance = await db.query(query, [score, feedback, performance_id]);
    if (updatedPerformance.rows.length === 0) {
      return res.status(404).send({ message: "Performance record not found." });
    }
    res.status(200).json({ message: "Performance updated successfully!", result: updatedPerformance.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating performance record.", error: error.message });
  }
};

// Delete
exports.deletePerformance = async (req, res) => {
  const { performance_id } = req.params;
  try {
    const query = `DELETE FROM Performance WHERE performance_id = $1 RETURNING *`;
    const deletedPerformance = await db.query(query, [performance_id]);
    if (deletedPerformance.rows.length === 0) {
      return res.status(404).send({ message: "Performance record not found." });
    }
    res.status(200).json({ message: "Performance deleted successfully!", result: deletedPerformance.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting performance record.", error: error.message });
  }
};
