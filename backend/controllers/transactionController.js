const db = require('../config/db');
const axios = require('axios');
const Decimal = require('decimal.js');
const crypto = require('crypto');
const limitService = require('../services/transaction-service/limit-service');
const auditService = require('../services/audit-service/index');

exports.sendMoney = async (req, res) => {
    const { receiver_email, amount } = req.body;
    const sender_id = req.user.id;
    const idempotencyKey = crypto.randomUUID(); // Built-in Node.js UUID

    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    // Financial Precision (Pillar 1)
    const transferAmount = new Decimal(amount);

    try {
        await limitService.checkLimits(sender_id, transferAmount.toNumber());
    } catch (limitError) {
        return res.status(400).json({ message: limitError.message });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Pessimistic Locking (Pillar 1) - Prevent race conditions
        const [senderWallet] = await connection.query("SELECT * FROM Wallets WHERE user_id = ? FOR UPDATE", [sender_id]);
        if (senderWallet.length === 0) throw new Error("Sender wallet not found");

        const senderBalance = new Decimal(senderWallet[0].balance);
        // Overdraft allowed: Removed strict balance check

        // 2. Get Receiver        const [receiverUser] = await connection.query("SELECT user_id, kyc_status FROM Users WHERE email = ?", [receiver_email]);
        if (receiverUser.length === 0) return res.status(404).json({ message: "Receiver not found" });
        
        const receiver_id = receiverUser[0].user_id;
        if (sender_id === receiver_id) return res.status(400).json({ message: "Cannot send money to yourself" });

        const [receiverWallet] = await connection.query("SELECT wallet_id, balance FROM Wallets WHERE user_id = ? FOR UPDATE", [receiver_id]);
        
        // 3. AI Fraud Check
        let fraudScore = 0;
        let riskLevel = 'low';
        let status = 'completed';

        try {
            const aiResponse = await axios.post(process.env.AI_SERVICE_URL || 'http://localhost:5001/predict', {
                amount: transferAmount.toNumber(),
                timestamp: new Date().toISOString(),
                sender_balance: senderBalance.toNumber(),
                receiver_balance: parseFloat(receiverWallet[0].balance)
            });
            fraudScore = aiResponse.data.fraud_score;
            riskLevel = aiResponse.data.risk_level;
            if (fraudScore > 0.85) status = 'flagged';
        } catch (aiError) { console.error("AI Service Error:", aiError.message); }

        // 4. Update Wallet Caches (Pillar 1)
        await connection.query("UPDATE Wallets SET balance = balance - ? WHERE wallet_id = ?", [transferAmount.toNumber(), senderWallet[0].wallet_id]);
        await connection.query("UPDATE Wallets SET balance = balance + ? WHERE wallet_id = ?", [transferAmount.toNumber(), receiverWallet[0].wallet_id]);

        // 5. Create Transaction Record
        const [txnResult] = await connection.query(
            "INSERT INTO Transactions (sender_wallet_id, receiver_wallet_id, amount, transaction_type, status, fraud_score, risk_level, reference_id) VALUES (?, ?, ?, 'transfer', ?, ?, ?, ?)",
            [senderWallet[0].wallet_id, receiverWallet[0].wallet_id, transferAmount.toNumber(), status, fraudScore, riskLevel, idempotencyKey]
        );
        const transactionId = txnResult.insertId;

        // 6. Double-Entry Ledger (Pillar 1) - Source of Truth
        // Entry A: Debit Sender
        await connection.query(
            "INSERT INTO Ledger (wallet_id, transaction_id, amount, entry_type, description) VALUES (?, ?, ?, 'debit', ?)",
            [senderWallet[0].wallet_id, transactionId, transferAmount.negated().toNumber(), 'debit', `Transfer to ${receiver_email}`]
        );

        // Entry B: Credit Receiver
        await connection.query(
            "INSERT INTO Ledger (wallet_id, transaction_id, amount, entry_type, description) VALUES (?, ?, ?, 'credit', ?)",
            [receiverWallet[0].wallet_id, transactionId, transferAmount.toNumber(), 'credit', `Received from ${req.user.email}`]
        );

        if (riskLevel !== 'low') {
            const [alertResult] = await connection.query("INSERT INTO Fraud_Alerts (transaction_id, risk_level, details) VALUES (?, ?, ?)", [transactionId, riskLevel, `High Fraud Score: ${fraudScore}`]);
            
            // Pillar 3: Real-time Admin Alert
            if (global.io) {
                global.io.to('admin_alerts').emit('NEW_FRAUD_ALERT', {
                    alert_id: alertResult.insertId,
                    transaction_id: transactionId,
                    risk_level: riskLevel,
                    score: fraudScore,
                    amount: transferAmount.toNumber(),
                    sender: req.user.email
                });
            }
        }

        await connection.commit();

        // 7. Pillar 3: WebSockets (Trigger global event - handled in server.js)
        if (global.io) {
            global.io.to(`user_${receiver_id}`).emit('PAYMENT_RECEIVED', {
                amount: transferAmount.toNumber(),
                sender: req.user.name,
                txn_id: transactionId
            });
        }

        auditService.log(sender_id, 'LEDGER_TXN_SUCCESS', `Txn ${transactionId}: $${amount} moved using Double-Entry. Key: ${idempotencyKey}`, req.ip);

        res.json({ 
            message: status === 'flagged' ? "Flagged for review" : "Transfer complete", 
            txn_id: transactionId,
            reference: idempotencyKey
        });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        auditService.log(sender_id, 'LEDGER_TXN_FAILED', `Txn failed: ${error.message}`, req.ip);
        res.status(500).json({ message: "Financial integrity error: Transaction rolled back." });
    } finally {
        connection.release();
    }
};

exports.getTransactions = async (req, res) => {
    try {
        // Get wallet ID first
        const [wallet] = await db.query("SELECT wallet_id FROM Wallets WHERE user_id = ?", [req.user.id]);
        if (wallet.length === 0) return res.status(404).json({ message: "Wallet not found" });

        const walletId = wallet[0].wallet_id;
        
        const [transactions] = await db.query(
            `SELECT t.*, u.email as other_party_email 
             FROM Transactions t
             LEFT JOIN Wallets w_sender ON t.sender_wallet_id = w_sender.wallet_id
             LEFT JOIN Wallets w_receiver ON t.receiver_wallet_id = w_receiver.wallet_id
             LEFT JOIN Users u ON (
                CASE 
                    WHEN t.sender_wallet_id = ? THEN w_receiver.user_id 
                    ELSE w_sender.user_id 
                END = u.user_id
             )
             WHERE t.sender_wallet_id = ? OR t.receiver_wallet_id = ?
             ORDER BY t.timestamp DESC`, 
             [walletId, walletId, walletId]
        );

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const [userCount] = await db.query("SELECT COUNT(*) as count FROM Users");
        const [txnCount] = await db.query("SELECT COUNT(*) as count FROM Transactions");
        const [flaggedCount] = await db.query("SELECT COUNT(*) as count FROM Transactions WHERE status = 'flagged' OR fraud_score > 0.5");
        
        res.json({
            users: userCount[0].count,
            transactions: txnCount[0].count,
            flagged: flaggedCount[0].count
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getMonthlyStatement = async (req, res) => {
    const { month, year } = req.query;
    const userId = req.user.id;
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01 00:00:00`;
    const endDate = new Date(year, month, 0).toISOString().split('T')[0] + ' 23:59:59';

    try {
        const [wallet] = await db.query("SELECT wallet_id FROM Wallets WHERE user_id = ?", [userId]);
        if (wallet.length === 0) return res.status(404).json({ message: "Wallet not found" });
        const walletId = wallet[0].wallet_id;

        // 1. Calculate Opening Balance (Sum of all ledger entries before this month)
        const [openingResult] = await db.query(
            "SELECT COALESCE(SUM(amount), 0) as balance FROM Ledger WHERE wallet_id = ? AND created_at < ?",
            [walletId, startDate]
        );
        let currentRunningBalance = parseFloat(openingResult[0].balance);

        // 2. Fetch all transactions for the month (CHRONOLOGICAL ORDER for balance tracking)
        const [transactions] = await db.query(`
            SELECT t.*, 
                   u_sender.email as sender_email, 
                   u_receiver.email as receiver_email,
                   CASE WHEN t.sender_wallet_id = ? THEN 'debit' ELSE 'credit' END as entry_type
            FROM Transactions t
            LEFT JOIN Wallets w_sender ON t.sender_wallet_id = w_sender.wallet_id
            LEFT JOIN Wallets w_receiver ON t.receiver_wallet_id = w_receiver.wallet_id
            LEFT JOIN Users u_sender ON w_sender.user_id = u_sender.user_id
            LEFT JOIN Users u_receiver ON w_receiver.user_id = u_receiver.user_id
            WHERE (t.sender_wallet_id = ? OR t.receiver_wallet_id = ?)
            AND t.timestamp BETWEEN ? AND ?
            ORDER BY t.timestamp ASC
        `, [walletId, walletId, walletId, startDate, endDate]);

        // 3. Process transactions to add running balances and calculate totals
        let totalIncome = 0;
        let totalSpent = 0;
        
        const processedTransactions = transactions.map(t => {
            const amt = parseFloat(t.amount);
            if (t.entry_type === 'debit') {
                currentRunningBalance -= amt;
                totalSpent += amt;
            } else {
                currentRunningBalance += amt;
                totalIncome += amt;
            }
            return {
                ...t,
                running_balance: currentRunningBalance
            };
        });

        res.json({
            openingBalance: openingResult[0].balance,
            closingBalance: currentRunningBalance,
            totalIncome,
            totalSpent,
            transactions: processedTransactions.reverse() // Reverse back for "Newest First" display
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to generate statement" });
    }
};

exports.payBill = async (req, res) => {
    const { biller_name, amount, category } = req.body;
    const userId = req.user.id;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [wallet] = await connection.query("SELECT * FROM Wallets WHERE user_id = ? FOR UPDATE", [userId]);
        if (parseFloat(wallet[0].balance) < amount) return res.status(400).json({ message: "Insufficient funds" });

        // 1. Deduct Cache
        await connection.query("UPDATE Wallets SET balance = balance - ? WHERE user_id = ?", [amount, userId]);

        // 2. Main Transaction
        const [txn] = await connection.query(
            "INSERT INTO Transactions (sender_wallet_id, amount, transaction_type, status) VALUES (?, ?, 'payment', 'completed')",
            [wallet[0].wallet_id, amount]
        );

        // 3. Ledger (Debit)
        await connection.query(
            "INSERT INTO Ledger (wallet_id, transaction_id, amount, entry_type, description) VALUES (?, ?, ?, 'debit', ?)",
            [wallet[0].wallet_id, txn.insertId, -amount, 'debit', `Bill Payment: ${biller_name} (${category})`]
        );

        await connection.commit();
        res.json({ message: `Payment to ${biller_name} successful` });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: "Bill payment failed" });
    } finally { connection.release(); }
};

exports.getFlaggedTransactions = async (req, res) => {
    try {
        const [transactions] = await db.query(
            `SELECT t.*, u_sender.email as sender, u_receiver.email as receiver 
             FROM Transactions t
             LEFT JOIN Wallets w_sender ON t.sender_wallet_id = w_sender.wallet_id
             LEFT JOIN Wallets w_receiver ON t.receiver_wallet_id = w_receiver.wallet_id
             LEFT JOIN Users u_sender ON w_sender.user_id = u_sender.user_id
             LEFT JOIN Users u_receiver ON w_receiver.user_id = u_receiver.user_id
             WHERE t.status = 'flagged' OR t.fraud_score > 0.5
             ORDER BY t.timestamp DESC`
        );
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

