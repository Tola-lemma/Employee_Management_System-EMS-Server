const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../Database/connection");
require("dotenv").config();

exports.loginEmployee = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).send({ message: "Email and Password are required." });
    }

    // Query to fetch the employee by email
    const query = ` SELECT e.employee_id, e.password, e.bad_login_attempts, e.is_locked, r.role_name as role
      FROM Employees e
      LEFT JOIN Roles r ON e.role_id = r.role_id
      WHERE e.email = $1`;
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(404).send({ message: "Employee not found." });
    }

    const employee = result.rows[0];

    // Check if account is locked
    if (employee.is_locked) {
      return res.status(403).send({
        message: "Your account is locked. Please contact the administrator.",
      });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, employee.password);

    if (!isPasswordValid) {
      // Increment bad login attempts
      const updatedAttempts = employee.bad_login_attempts + 1;

      if (updatedAttempts >= 5) {
        // Lock the account after 5 failed attempts
        await db.query(
          `UPDATE Employees SET bad_login_attempts = $1, is_locked = TRUE WHERE email = $2`,
          [updatedAttempts, email]
        );
        return res.status(403).send({
          message:
            "Too many failed login attempts. Your account is locked. Please contact the administrator.",
        });
      } else {
        // Update bad login attempts
        await db.query(
          `UPDATE Employees SET bad_login_attempts = $1 WHERE email = $2`,
          [updatedAttempts, email]
        );
        return res.status(401).send({
          message: "Invalid credentials. Please try again.",
          remainingAttempts: 5 - updatedAttempts,
        });
      }
    }

    // Reset bad login attempts on successful login
    await db.query(
      `UPDATE Employees SET bad_login_attempts = 0 WHERE email = $1`,
      [email]
    );

    // Generate JWT token
    const token = jwt.sign(
      { employee_id: employee.employee_id, email,  role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Login successful.",
      status: "success",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error during login.",
      error: error.message,
    });
  }
};
