const db = require("../Database/connection");

// Create
exports.createAttendance = async (req, res) => {
  const { employee_id, date, status, check_in_time, check_out_time } = req.body;
  try {
    // Check if employee exists
    const empCheck = await db.query(`SELECT * FROM Employees WHERE employee_id = $1`, [employee_id]);
    if (empCheck.rows.length === 0) {
      return res.status(404).json({ message: "Employee Not Found" });
    }

    // Check if attendance record already exists for the given employee and date
    const attendanceCheck = await db.query(`
      SELECT * FROM Attendance 
      WHERE employee_id = $1 AND date = $2
    `, [employee_id, date]);

    if (attendanceCheck.rows.length > 0) {
      // If the status is different, we toggle it (i.e., update to the new status)
      const existingAttendance = attendanceCheck.rows[0];
      if (existingAttendance.status !== status) {
        const updatedAttendance = await db.query(`
          UPDATE Attendance
          SET status = $1, check_in_time = $2, check_out_time = $3
          WHERE attendance_id = $4 RETURNING *
        `, [status, check_in_time, check_out_time, existingAttendance.attendance_id]);

        return res.status(200).json({
          message: "Attendance status updated successfully!",
          result: updatedAttendance.rows[0],
        });
      } else {
        // If the status is the same, we update the check-in and check-out times if provided
        const updatedAttendance = await db.query(`
          UPDATE Attendance
          SET check_in_time = $1, check_out_time = $2
          WHERE attendance_id = $3 RETURNING *
        `, [check_in_time, check_out_time, existingAttendance.attendance_id]);

        return res.status(200).json({
          message: "Attendance times updated successfully!",
          result: updatedAttendance.rows[0],
        });
      }
    }

    // If no record exists, create the new attendance record
    const query = `
      INSERT INTO Attendance (employee_id, date, status, check_in_time, check_out_time)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const attendance = await db.query(query, [employee_id, date, status, check_in_time, check_out_time]);

    res.status(201).json({
      message: "Attendance record created successfully!",
      result: attendance.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating attendance record.", error: error.message });
  }
};

// Read
exports.getAttendance = async (req, res) => {
  const { attendance_id } = req.params;

  try {
    let query = `
      SELECT 
        a.attendance_id, 
        a.date, 
        a.status,
        a.check_in_time,
        e.employee_id,
        a.check_out_time ,
        e.first_name || ' ' || e.last_name AS employee_name 
      FROM Attendance a
      LEFT JOIN Employees e ON a.employee_id = e.employee_id
    `;
    const values = [];

    if (attendance_id) {
      query += " WHERE a.attendance_id = $1";
      values.push(attendance_id);
    }

    const attendance = await db.query(query, values);

    if (attendance_id && attendance.rows.length === 0) {
      return res.status(404).send({ message: "Attendance record not found." });
    }

    res.status(200).json({
      message: "Attendance records retrieved successfully.",
      status: "success",
      result: attendance.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving attendance.", error: error.message });
  }
};

// Update
exports.updateAttendance = async (req, res) => {
  const { attendance_id } = req.params;
  const { status, check_in_time, check_out_time } = req.body;
  try {
    const query = `
      UPDATE Attendance
      SET status = $1, check_in_time = $2, check_out_time = $3
      WHERE attendance_id = $4 RETURNING *`;
    const updatedAttendance = await db.query(query, [status, check_in_time, check_out_time, attendance_id]);
    if (updatedAttendance.rows.length === 0) {
      return res.status(404).send({ message: "Attendance record not found." });
    }
    res.status(200).json({ message: "Attendance updated successfully!", result: updatedAttendance.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating attendance record.", error: error.message });
  }
};

// Delete
exports.deleteAttendance = async (req, res) => {
  const { attendance_id } = req.params;
  try {
    const query = `DELETE FROM Attendance WHERE attendance_id = $1 RETURNING *`;
    const deletedAttendance = await db.query(query, [attendance_id]);
    if (deletedAttendance.rows.length === 0) {
      return res.status(404).send({ message: "Attendance record not found." });
    }
    res.status(200).json({ message: "Attendance deleted successfully!", result: deletedAttendance.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting attendance record.", error: error.message });
  }
};
