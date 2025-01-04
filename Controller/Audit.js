const db = require("../Database/connection");

// Create
exports.createAuditLog = async (req, res) => {
  const { employee_id, action, details } = req.body;
  try {
    const query = `
      INSERT INTO Audit (employee_id, action, details)
      VALUES ($1, $2, $3) RETURNING *`;
    const auditLog = await db.query(query, [employee_id, action, details]);
    res.status(201).json({ message: "Audit log created successfully!", result: auditLog.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating audit log.", error: error.message });
  }
};

// Read
exports.getAuditLogs = async (req, res) => {
  const { audit_id } = req.params;

  try {
    let query = `
      SELECT 
        a.audit_id, 
        a.action, 
        a.timestamp, 
        a.details, 
        e.first_name || ' ' || e.last_name AS employee_name 
      FROM Audit a
      JOIN Employees e ON a.employee_id = e.employee_id
    `;
    const values = [];

    if (audit_id) {
      query += " WHERE a.audit_id = $1";
      values.push(audit_id);
    }

    const auditLogs = await db.query(query, values);

    if (audit_id && auditLogs.rows.length === 0) {
      return res.status(404).send({ message: "Audit log not found." });
    }

    res.status(200).json({
      message: "Audit logs retrieved successfully.",
      status: "success",
      result: auditLogs.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving audit logs.", error: error.message });
  }
};

// Delete
exports.deleteAuditLog = async (req, res) => {
  const { audit_id } = req.params;
  try {
    const query = `DELETE FROM Audit WHERE audit_id = $1 RETURNING *`;
    const deletedAuditLog = await db.query(query, [audit_id]);
    if (deletedAuditLog.rows.length === 0) {
      return res.status(404).send({ message: "Audit log not found." });
    }
    res.status(200).json({ message: "Audit log deleted successfully!", result: deletedAuditLog.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting audit log.", error: error.message });
  }
};
