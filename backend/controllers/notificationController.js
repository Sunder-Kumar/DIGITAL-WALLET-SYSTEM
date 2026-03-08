const db = require('../config/db');

exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(
            "SELECT * FROM Notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
            [req.user.id]
        );
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

exports.markAsRead = async (req, res) => {
    const { notificationId } = req.params;
    try {
        await db.query(
            "UPDATE Notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?",
            [notificationId, req.user.id]
        );
        res.json({ message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update notification" });
    }
};

exports.clearAll = async (req, res) => {
    try {
        await db.query("DELETE FROM Notifications WHERE user_id = ?", [req.user.id]);
        res.json({ message: "All notifications cleared" });
    } catch (error) {
        res.status(500).json({ message: "Failed to clear notifications" });
    }
};
