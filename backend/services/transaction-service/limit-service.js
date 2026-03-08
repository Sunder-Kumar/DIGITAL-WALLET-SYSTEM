const db = require('../../config/db');

class TransactionLimitService {
  async checkLimits(userId, amount) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Get Limits from Wallets table
    const [wallets] = await db.query("SELECT daily_limit FROM Wallets WHERE user_id = ?", [userId]);
    const maxDaily = wallets.length > 0 ? parseFloat(wallets[0].daily_limit) : 5000.00;
    const maxSingle = maxDaily * 0.4; // Default single transaction limit to 40% of daily limit

    if (amount > maxSingle) {
      throw new Error(`Amount exceeds single transaction limit of $${maxSingle}`);
    }

    // Check Daily Total
    const [result] = await db.query(
      `SELECT SUM(amount) as daily_total 
       FROM Transactions 
       WHERE sender_wallet_id = (SELECT wallet_id FROM Wallets WHERE user_id = ?) 
       AND DATE(timestamp) = ?
       AND status NOT IN ('failed', 'blocked')`,
      [userId, today]
    );

    const currentDailyTotal = result[0].daily_total || 0;
    
    if (parseFloat(currentDailyTotal) + parseFloat(amount) > maxDaily) {
        throw new Error(`Transaction would exceed daily limit of $${maxDaily}. Used today: $${currentDailyTotal}`);
    }

    return true;
  }
}

module.exports = new TransactionLimitService();
