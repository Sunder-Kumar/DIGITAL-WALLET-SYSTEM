const db = require('../config/db');
const Decimal = require('decimal.js');

exports.getSpendingInsights = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dayOfMonth = now.getDate() || 1;

        // 1. Daily Spending Velocity (Last 7 Days)
        const dailyData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

            const [dayResult] = await db.query(`
                SELECT COALESCE(SUM(ABS(amount)), 0) as total 
                FROM Ledger l JOIN Wallets w ON l.wallet_id = w.wallet_id
                WHERE w.user_id = ? AND l.entry_type = 'debit'
                AND DATE(l.created_at) = ?
            `, [userId, dateStr]);

            dailyData.push({
                name: dayName,
                amount: parseFloat(dayResult[0].total)
            });
        }

        // 2. Real-time Calculations
        const [thisMonthResult] = await db.query(`
            SELECT COALESCE(SUM(ABS(amount)), 0) as total FROM Ledger l
            JOIN Wallets w ON l.wallet_id = w.wallet_id
            WHERE w.user_id = ? AND l.entry_type = 'debit'
            AND MONTH(l.created_at) = MONTH(CURRENT_DATE())
            AND YEAR(l.created_at) = YEAR(CURRENT_DATE())
        `, [userId]);

        const [walletResult] = await db.query("SELECT balance FROM Wallets WHERE user_id = ?", [userId]);
        if (walletResult.length === 0) throw new Error("Wallet not found");
        
        const currentSpend = new Decimal(thisMonthResult[0].total || 0);
        const balance = new Decimal(walletResult[0].balance || 0);

        // 3. Robust Predictive Logic (Improved Velocity)
        const recentSpend = dailyData.reduce((sum, d) => sum + d.amount, 0);
        const rollingVelocity = new Decimal(recentSpend).dividedBy(7);
        const monthVelocity = currentSpend.dividedBy(Math.max(1, dayOfMonth));
        
        const effectiveVelocity = monthVelocity.times(0.7).plus(rollingVelocity.times(0.3));
        const projectedSpend = currentSpend.plus(effectiveVelocity.times(daysInMonth - dayOfMonth));
        
        let healthScore = 100;
        if (currentSpend.gt(0)) {
            const monthsCovered = balance.dividedBy(projectedSpend.plus(1));
            healthScore = Math.min(100, Math.max(10, monthsCovered.times(40).toNumber() + 20));
        }

        // 4. Anomaly Detection (Fixed ABS comparison)
        const [spikeCheck] = await db.query(`
            SELECT ABS(amount) as amount, description FROM Ledger l
            JOIN Wallets w ON l.wallet_id = w.wallet_id
            WHERE w.user_id = ? AND l.entry_type = 'debit'
            AND ABS(amount) > (SELECT COALESCE(AVG(ABS(amount)), 0) * 3 FROM Ledger WHERE wallet_id = w.wallet_id)
            ORDER BY l.created_at DESC LIMIT 1
        `, [userId]);

        // 5. Category Breakdown (New Feature)
        const [categoryResult] = await db.query(`
            SELECT category as name, SUM(ABS(amount)) as value 
            FROM Ledger l
            JOIN Wallets w ON l.wallet_id = w.wallet_id
            WHERE w.user_id = ? AND l.entry_type = 'debit'
            AND MONTH(l.created_at) = MONTH(CURRENT_DATE())
            AND YEAR(l.created_at) = YEAR(CURRENT_DATE())
            GROUP BY category
        `, [userId]);

        const categoryData = categoryResult.map(item => ({
            name: item.name,
            value: parseFloat(item.value)
        }));

        res.json({
            chartData: dailyData,
            categoryData: categoryData,
            projection: {
                current: currentSpend.toNumber(),
                projected: projectedSpend.toFixed(2),
                remainingDays: daysInMonth - dayOfMonth
            },
            health: {
                score: Math.round(healthScore),
                label: healthScore > 80 ? 'Excellent' : healthScore > 50 ? 'Stable' : 'Critical',
                color: healthScore > 80 ? '#00c853' : healthScore > 50 ? '#5d3fd3' : '#ff3d00'
            },
            aiCoach: {
                message: currentSpend.equals(0) 
                    ? "Welcome! Make your first transaction to unlock AI wealth coaching."
                    : (healthScore < 40 
                        ? "Warning: Your spending velocity is high. I suggest pausing non-essential transfers."
                        : "You're doing great! You're on track to grow your wealth this month."),
                anomaly: spikeCheck.length > 0 ? `Unusual spike detected: Rs. ${Math.abs(spikeCheck[0].amount)}` : null
            }
        });

    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({ message: "Internal Server Error during analytics calculation" });
    }
};
