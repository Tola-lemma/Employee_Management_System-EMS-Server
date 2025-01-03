const bcrypt = require("bcrypt");
const db = require("../../Database/connection");

exports.changePassword = async (req, res) => {
  const { employee_id } = req.params; 
  const { old_password, new_password } = req.body;

  try {
    if (!old_password || !new_password) {
      return res.status(400).send({ message: "Both old and new passwords are required." });
    }

    if (new_password.length < 8) {
      return res.status(400).send({ message: "New password must be at least 8 characters long." });
    }

    // Fetch the current hashed password from the database
    const query = `SELECT password FROM Employees WHERE employee_id = $1`;
    const result = await db.query(query, [employee_id]);

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Employee not found." });
    }

    const currentHashedPassword = result.rows[0].password;

    // Check if the old password is correct
    const isMatch = await bcrypt.compare(old_password, currentHashedPassword);
    if (!isMatch) {
      return res.status(400).send({ message: "Old password is incorrect." });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Update the password in the database
    const updateQuery = `
      UPDATE Employees 
      SET password = $1 
      WHERE employee_id = $2 
      RETURNING employee_id, first_name, last_name
    `;
    const updateResult = await db.query(updateQuery, [hashedNewPassword, employee_id]);

    const updatedEmployee = updateResult.rows[0];

    res.status(200).json({
      message: "Password changed successfully!",
      status: "success",
      result: updatedEmployee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error changing password.", error: error.message });
  }
};