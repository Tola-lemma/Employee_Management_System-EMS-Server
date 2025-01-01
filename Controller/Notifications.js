const db = require("../Database/connection");

// Create
exports.createNotification = async (req, res) => {
  const { employee_id, message, type } = req.body;
  try {
    const query = `
      INSERT INTO Notifications (employee_id, message, type)
      VALUES ($1, $2, $3) RETURNING *`;
    const notification = await db.query(query, [employee_id, message, type]);
    res.status(201).json({ message: "Notification created successfully!", result: notification.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating notification.", error: error.message });
  }
};

// Read
exports.getNotifications = async (req, res) => {
  const { notification_id } = req.params;
  try {
    const query = notification_id
      ? `SELECT * FROM Notifications WHERE notification_id = $1`
      : `SELECT * FROM Notifications`;
    const notifications = await db.query(query, notification_id ? [notification_id] : []);
    res.status(200).json({ message: "Notifications fetched successfully!", result: notifications.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching notifications.", error: error.message });
  }
};

// Update
exports.markNotificationAsRead = async (req, res) => {
  const { notification_id } = req.params;
  try {
    const query = `
      UPDATE Notifications
      SET is_read = TRUE
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
