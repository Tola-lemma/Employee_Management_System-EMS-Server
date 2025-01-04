const db = require("../Database/connection");

// Create
exports.createGamification = async (req, res) => {
  const { employee_id, points, level } = req.body;
  try {
    const query = `
      INSERT INTO Gamifications (employee_id, points, level)
      VALUES ($1, $2, $3) RETURNING *`;
    const gamification = await db.query(query, [employee_id, points, level]);
    res.status(201).json({ message: "Gamification record created successfully!", result: gamification.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating gamification record.", error: error.message });
  }
};

// Read
exports.getGamifications = async (req, res) => {
  const { gamification_id } = req.params;

  try {
    let query = `
      SELECT 
        g.gamification_id, 
        g.points, 
        g.level, 
        e.first_name || ' ' || e.last_name AS employee_name 
      FROM Gamifications g
      JOIN Employees e ON g.employee_id = e.employee_id
    `;
    const values = [];

    if (gamification_id) {
      query += " WHERE g.gamification_id = $1";
      values.push(gamification_id);
    }

    const gamifications = await db.query(query, values);

    if (gamification_id && gamifications.rows.length === 0) {
      return res.status(404).send({ message: "Gamification record not found." });
    }

    res.status(200).json({
      message: "Gamification records retrieved successfully.",
      status: "success",
      result: gamifications.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving gamifications.", error: error.message });
  }
};

// Update
exports.updateGamification = async (req, res) => {
  const { gamification_id } = req.params;
  const { points, level } = req.body;
  try {
    const query = `
      UPDATE Gamifications
      SET points = $1, level = $2
      WHERE gamification_id = $3 RETURNING *`;
    const updatedGamification = await db.query(query, [points, level, gamification_id]);
    if (updatedGamification.rows.length === 0) {
      return res.status(404).send({ message: "Gamification record not found." });
    }
    res.status(200).json({ message: "Gamification updated successfully!", result: updatedGamification.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating gamification record.", error: error.message });
  }
};

// Delete
exports.deleteGamification = async (req, res) => {
  const { gamification_id } = req.params;
  try {
    const query = `DELETE FROM Gamifications WHERE gamification_id = $1 RETURNING *`;
    const deletedGamification = await db.query(query, [gamification_id]);
    if (deletedGamification.rows.length === 0) {
      return res.status(404).send({ message: "Gamification record not found." });
    }
    res.status(200).json({ message: "Gamification deleted successfully!", result: deletedGamification.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting gamification record.", error: error.message });
  }
};
