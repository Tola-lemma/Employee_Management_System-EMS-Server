const db = require("../Database/connection");
const calculateLevel = (points) => {
  if (points >= 1000) return 'Expert';
  if (points >= 500) return 'Intermediate';
  return 'Beginner';
};

const awardBadge = (points) => {
  const badges = [];
  if (points >= 1000) badges.push('Master Performer');
  if (points >= 500) badges.push('Top Contributor');
  if (points >= 100) badges.push('Beginner Badge');
  return badges;
}

exports.createGamification = async (req, res) => {
  const { employee_id, points } = req.body;
  const level = calculateLevel(points);
  const badges = JSON.stringify(awardBadge(points));

  try {
    const query = `
      INSERT INTO Gamification (employee_id, points, level, badges)
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const gamification = await db.query(query, [employee_id, points, level, badges]);
    res.status(201).json({ message: "Gamification record created successfully!", result: gamification.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating gamification record.", error: error.message });
  }
};
exports.getGamifications = async (req, res) => {
  const { gamification_id } = req.params; // Get the gamification_id from the request parameters

  try {
    let query = `
      SELECT 
        g.gamification_id,
        e.first_name || ' ' || e.last_name AS employee_name, 
        g.points, 
        g.level,
        g.streak,
        g.badges,
        g.last_active
      FROM Gamification g
      JOIN Employees e ON g.employee_id = e.employee_id
    `;

    const values = [];

    // Add condition if gamification_id is provided
    if (gamification_id) {
      query += " WHERE g.gamification_id = $1";
      values.push(gamification_id);
    }

    // Order and fetch results
    query += " ORDER BY g.points DESC";

    const results = await db.query(query, values);

    // Handle case where no record is found
    if (gamification_id && results.rows.length === 0) {
      return res.status(404).json({ message: "Gamification record not found." });
    }

    res.status(200).json({
      message: "Gamifications retrieved successfully.",
      result: results.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving gamifications.", error: error.message });
  }
};

exports.updateGamification = async (req, res) => {
  const { gamification_id } = req.params;
  const { points } = req.body;

  try {
    // Retrieve the current gamification record
    const getQuery = `SELECT * FROM Gamification WHERE gamification_id = $1`;
    const currentRecord = await db.query(getQuery, [gamification_id]);

    if (currentRecord.rows.length === 0) {
      return res.status(404).send({ message: "Gamification record not found." });
    }

    const previousPoints = currentRecord.rows[0].points;
    const lastActive = new Date(currentRecord.rows[0].last_active);
    const today = new Date();

    // Calculate new streak
    const isConsecutiveDay = 
      lastActive.toDateString() === new Date(today.setDate(today.getDate() - 1)).toDateString();
    const streak = isConsecutiveDay ? currentRecord.rows[0].streak + 1 : 1;

    // Calculate new level and badges
    const level = calculateLevel(points);
    const badges = JSON.stringify(awardBadge(points));

    const updateQuery = `
      UPDATE Gamification
      SET points = $1, level = $2, badges = $3, streak = $4, last_active = NOW(), updated_at = NOW()
      WHERE gamification_id = $5
      RETURNING *`;

    const updatedGamification = await db.query(updateQuery, [points, level, badges, streak, gamification_id]);

    res.status(200).json({
      message: "Gamification updated successfully!",
      result: updatedGamification.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating gamification record.", error: error.message });
  }
};

exports.deleteGamification = async (req, res) => {
  const { gamification_id } = req.params;
  try {
    const query = `DELETE FROM Gamification WHERE gamification_id = $1 RETURNING *`;
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