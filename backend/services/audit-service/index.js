const db = require('../../config/db');
const logger = require('../../utils/logger');

class AuditLogService {
  async log(userId, action, details, ipAddress = '0.0.0.0') {
    try {
      await db.query(
        "INSERT INTO Audit_Logs (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)",
        [userId, action, details, ipAddress]
      );
      logger.info(`Audit Log: User ${userId} performed ${action}`);
    } catch (error) {
      logger.error('Failed to write audit log:', error);
    }
  }
}

module.exports = new AuditLogService();
