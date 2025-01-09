const db = require("../Database/connection");

// Create
exports.createNotification = async (req, res) => {
  const { employee_id, message, type } = req.body;
  try {
    const query = `
      INSERT INTO Notifications (employee_id, message, type)
      VALUES ($1, $2, $3) RETURNING *`;
      const empCheck = await db.query(`SELECT * FROM Employees WHERE employee_id = $1`, [employee_id]);
      if (empCheck.rows.length === 0) {
        return res.status(404).json({ message: "Employee Not Found" });
      }
    const notification = await db.query(query, [employee_id, message, type]);
    res.status(201).json({ message: "Notification created successfully!", result: notification.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating notification.", error: error.message });
  }
};

// Read
exports.getNotifications = async (req, res) => {
  const { employee_id } = req.params;

  try {
    let query = `
      SELECT 
        n.notification_id, 
        n.message, 
        n.type, 
        n.created_at, 
        n.updated_at, 
        e.first_name || ' ' || e.last_name AS employee_name 
      FROM Notifications n
      LEFT JOIN Employees e ON n.employee_id = e.employee_id
    `;
    const values = [];

    if (employee_id) {
      query += " WHERE n.employee_id = $1";
      values.push(employee_id);
    }

    const notifications = await db.query(query, values);

    if (employee_id && notifications.rows.length === 0) {
      return res.status(404).send({ message: "Notification not found." });
    }

    res.status(200).json({
      message: "Notifications retrieved successfully.",
      status: "success",
      result: notifications.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving notifications.", error: error.message });
  }
};


// Update
exports.markNotificationAsRead = async (req, res) => {
  const { notification_id } = req.params;
  try {
    const query = `
      UPDATE Notifications
      SET is_read = TRUE, updated_at = NOW()
      WHERE notification_id = $1 RETURNING *`;
    const updatedNotification = await db.query(query, [notification_id]);
    if (updatedNotification.rows.length === 0) {
      return res.status(404).send({ message: "Notification not found." });
    }
    res.status(200).json({ message: "Notification marked as read!", result: updatedNotification.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating notification.", error: error.message });
  }
};

// Delete
exports.deleteNotification = async (req, res) => {
  const { notification_id } = req.params;
  try {
    const query = `DELETE FROM Notifications WHERE notification_id = $1 RETURNING *`;
    const deletedNotification = await db.query(query, [notification_id]);
    if (deletedNotification.rows.length === 0) {
      return res.status(404).send({ message: "Notification not found." });
    }
    res.status(200).json({ message: "Notification deleted successfully!", result: deletedNotification.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting notification.", error: error.message });
  }
};
