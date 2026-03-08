const db = require('../config/db');

exports.getNotifications = async (req, res) => {
    try {
        const [notifications] = await db.query(`
            SELECT n.*, t.amount as txn_amount, t.timestamp as txn_time, t.reference_id, t.transaction_type,
                   u_sender.name as sender_name, u_sender.email as sender_email,
                   u_receiver.name as receiver_name, u_receiver.email as receiver_email
            FROM Notifications n
            LEFT JOIN Transactions t ON n.transaction_id = t.transaction_id
            LEFT JOIN Wallets w_sender ON t.sender_wallet_id = w_sender.wallet_id
            LEFT JOIN Wallets w_receiver ON t.receiver_wallet_id = w_receiver.wallet_id
            LEFT JOIN Users u_sender ON w_sender.user_id = u_sender.user_id
            LEFT JOIN Users u_receiver ON w_receiver.user_id = u_receiver.user_id
            WHERE n.user_id = ? 
            ORDER BY n.created_at DESC LIMIT 50
        `, [req.user.id]);
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
