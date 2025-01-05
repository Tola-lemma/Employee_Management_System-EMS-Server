const db = require("../Database/connection");

// Create Leave Request
exports.createLeaveRequest = async (req, res) => {
  const { employee_id, start_date, end_date, reason } = req.body;


  try {
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const diffTime = Math.abs(endDate - startDate);
    const daysRequested = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1; // Add 1 for inclusive dates

    // Check the employee's remaining leave
    const leaveCheckQuery = `SELECT remaining_leave FROM Employees WHERE employee_id = $1`;
    const leaveCheckResult = await db.query(leaveCheckQuery, [employee_id]);

    if (leaveCheckResult.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const remainingLeave = leaveCheckResult.rows[0].remaining_leave;

    // Check if the employee has enough leave
    if (remainingLeave < daysRequested) {
      return res.status(400).json({ message: "Insufficient leave balance." });
    }

    // Insert leave request
    const query = `
      INSERT INTO Leave (employee_id, start_date, end_date, reason)
      VALUES ($1, $2, $3, $4) RETURNING *`;
    const leaveRequest = await db.query(query, [employee_id, start_date, end_date, reason]);

    // Update remaining leave in the Employees table
    const updateLeaveBalanceQuery = `
      UPDATE Employees
      SET remaining_leave = $1
      WHERE employee_id = $2 RETURNING *`;
    await db.query(updateLeaveBalanceQuery, [remainingLeave - daysRequested, employee_id]);

    // Success response
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
        e.total_leave, 
        e.remaining_leave,
        l.created_at,
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
  const { start_date, end_date, reason } = req.body;
  
  try {
    const query = `
      UPDATE Leave
      SET 
        start_date = COALESCE($1, start_date),
        end_date = COALESCE($2, end_date),
        reason = COALESCE($3, reason)
      WHERE leave_id = $4
      RETURNING *`;
    const updatedLeaveRequest = await db.query(query, [start_date, end_date, reason, leave_id]);  
    if (updatedLeaveRequest.rows.length === 0) {
      return res.status(404).send({ message: "Leave request not found." });
    }
    res.status(200).json({
      success: true,
      message: "Leave request updated successfully",
      data: updatedLeaveRequest.rows[0],
    });  
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
