const db = require("../Database/connection");

// Create
exports.createLeaveRequest = async (req, res) => {
  const { employee_id, start_date, end_date, reason } = req.body;
  try {
    const query = `
      INSERT INTO Leave (employee_id, start_date, end_date, reason)
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const leaveRequest = await db.query(query, [employee_id, start_date, end_date, reason]);
    res.status(201).json({ message: "Leave request created successfully!", result: leaveRequest.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating leave request.", error: error.message });
  }
};

// Read
exports.getLeaveRequests = async (req, res) => {
  const { leave_id } = req.params;

  try {
    let query = `
      SELECT 
        l.leave_id, 
        l.start_date, 
        l.end_date, 
        l.reason, 
        l.status, 
        e.first_name || ' ' || e.last_name AS employee_name 
      FROM Leave l
      JOIN Employees e ON l.employee_id = e.employee_id
    `;
    const values = [];

    if (leave_id) {
      query += " WHERE l.leave_id = $1";
      values.push(leave_id);
    }

    const leaveRequests = await db.query(query, values);

    if (leave_id && leaveRequests.rows.length === 0) {
      return res.status(404).send({ message: "Leave request not found." });
    }

    res.status(200).json({
      message: "Leave requests retrieved successfully.",
      status: "success",
      result: leaveRequests.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving leave requests.", error: error.message });
  }
};

// Update
exports.updateLeaveRequest = async (req, res) => {
  const { leave_id } = req.params;
  const { status } = req.body;
  try {
    const query = `
      UPDATE Leave
      SET status = $1
      WHERE leave_id = $2 RETURNING *`;
    const updatedLeaveRequest = await db.query(query, [status, leave_id]);
    if (updatedLeaveRequest.rows.length === 0) {
      return res.status(404).send({ message: "Leave request not found." });
    }
    res.status(200).json({ message: "Leave request updated successfully!", result: updatedLeaveRequest.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating leave request.", error: error.message });
  }
};

// Delete
exports.deleteLeaveRequest = async (req, res) => {
  const { leave_id } = req.params;
  try {
    const query = `DELETE FROM Leave WHERE leave_id = $1 RETURNING *`;
    const deletedLeaveRequest = await db.query(query, [leave_id]);
    if (deletedLeaveRequest.rows.length === 0) {
      return res.status(404).send({ message: "Leave request not found." });
    }
    res.status(200).json({ message: "Leave request deleted successfully!", result: deletedLeaveRequest.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting leave request.", error: error.message });
  }
};
