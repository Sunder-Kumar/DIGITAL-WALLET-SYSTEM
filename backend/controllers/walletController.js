const db = require('../config/db');
const { encrypt } = require('../utils/encryption');

exports.getBalance = async (req, res) => {
    try {
        const [wallet] = await db.query("SELECT * FROM Wallets WHERE user_id = ?", [req.user.id]);
        if (wallet.length === 0) return res.status(404).json({ message: "Wallet not found" });
        res.json(wallet[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.addMoney = async (req, res) => {
    const { amount, source_id, source_type } = req.body; // source_id could be a card_id
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update Wallet Balance Cache
        await connection.query("UPDATE Wallets SET balance = balance + ? WHERE user_id = ?", [amount, req.user.id]);
        const [wallet] = await connection.query("SELECT wallet_id FROM Wallets WHERE user_id = ?", [req.user.id]);
        const walletId = wallet[0].wallet_id;

        // 2. Create Transaction Record
        const [txn] = await connection.query(
            "INSERT INTO Transactions (sender_wallet_id, receiver_wallet_id, amount, transaction_type, status, category, note) VALUES (?, ?, ?, 'deposit', 'completed', ?, ?)",
            [null, walletId, amount, 'Other', `Deposit from ${source_type || 'Linked Method'}`]
        );

        // 3. Ledger Entry (Credit)
        await connection.query(
            "INSERT INTO Ledger (wallet_id, transaction_id, amount, entry_type, description, category, note) VALUES (?, ?, ?, 'credit', ?, ?, ?)",
            [walletId, txn.insertId, amount, 'credit', `Deposit from ${source_type || 'Linked Method'}`, 'Other', `Deposit from ${source_type || 'Linked Method'}`]
        );

        await connection.commit();
        res.json({ message: "Funds added successfully", new_balance: amount });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: "Deposit failed" });
    } finally { connection.release(); }
};

// --- Payment Methods ---
exports.getCards = async (req, res) => {
    try {
        const [cards] = await db.query("SELECT card_id, brand, last4, is_primary, card_holder_name FROM Cards WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch cards" });
    }
};

exports.addCard = async (req, res) => {
    const { cardHolder, cardNumber, expiry, cvv } = req.body;
    
    if (!cardHolder || !cardNumber || !expiry || !cvv) {
        return res.status(400).json({ message: "All card details are required" });
    }

    try {
        const last4 = cardNumber.slice(-4);
        const brand = cardNumber.startsWith('4') ? 'Visa' : 'Mastercard';
        
        // Encrypt sensitive full details (Pillar 4)
        const sensitiveData = JSON.stringify({ cardNumber, expiry, cvv });
        const encryptedDetails = encrypt(sensitiveData);

        // Check if this is the first card
        const [existing] = await db.query("SELECT card_id FROM Cards WHERE user_id = ?", [req.user.id]);
        const isPrimary = existing.length === 0;

        await db.query(
            "INSERT INTO Cards (user_id, card_holder_name, brand, last4, encrypted_details, is_primary) VALUES (?, ?, ?, ?, ?, ?)",
            [req.user.id, cardHolder, brand, last4, encryptedDetails, isPrimary]
        );

        res.status(201).json({ message: "Card added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add card" });
    }
};

exports.deleteCard = async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user.id;
    console.log(`[DEBUG] Attempting to delete card ${cardId} for user ${userId}`);
    console.log(`[DEBUG] Request user object:`, req.user);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Check if the card belongs to the user and if it's primary
        const [card] = await connection.query("SELECT * FROM Cards WHERE card_id = ? AND user_id = ?", [cardId, userId]);
        if (card.length === 0) {
            console.log(`[DEBUG] Card check failed. Query: SELECT * FROM Cards WHERE card_id = ${cardId} AND user_id = ${userId}`);
            return res.status(404).json({ message: "Card not found (check log for details)" });
        }

        const wasPrimary = card[0].is_primary;

        // 2. Delete the card
        await connection.query("DELETE FROM Cards WHERE card_id = ? AND user_id = ?", [cardId, userId]);

        // 3. If it was primary, pick another card to be primary
        if (wasPrimary) {
            const [others] = await connection.query("SELECT card_id FROM Cards WHERE user_id = ? LIMIT 1", [userId]);
            if (others.length > 0) {
                await connection.query("UPDATE Cards SET is_primary = 1 WHERE card_id = ?", [others[0].card_id]);
            }
        }

        await connection.commit();
        res.json({ message: "Card removed successfully" });
    } catch (error) {
        await connection.rollback();
        console.error("DELETE CARD ERROR:", error);
        res.status(500).json({ message: "Failed to remove card", error: error.message });
    } finally {
        connection.release();
    }
};

exports.setPrimaryCard = async (req, res) => {
    const { cardId } = req.params;
    const userId = req.user.id;
    console.log(`[DEBUG] Attempting to set card ${cardId} as primary for user ${userId}`);

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Verify card exists and belongs to user
        const [card] = await connection.query("SELECT * FROM Cards WHERE card_id = ? AND user_id = ?", [cardId, userId]);
        if (card.length === 0) {
            console.log(`[DEBUG] Card check failed. Query: SELECT * FROM Cards WHERE card_id = ${cardId} AND user_id = ${userId}`);
            return res.status(404).json({ message: "Card not found" });
        }

        // 2. Set all user's cards to not primary
        await connection.query("UPDATE Cards SET is_primary = 0 WHERE user_id = ?", [userId]);

        // 3. Set selected card to primary
        await connection.query("UPDATE Cards SET is_primary = 1 WHERE card_id = ?", [cardId]);

        await connection.commit();
        res.json({ message: "Primary card updated" });
    } catch (error) {
        await connection.rollback();
        console.error("SET PRIMARY CARD ERROR:", error);
        res.status(500).json({ message: "Failed to update primary card", error: error.message });
    } finally {
        connection.release();
    }
};

// --- Bank Account Linking ---
exports.getBanks = async (req, res) => {
    try {
        const [banks] = await db.query("SELECT * FROM Bank_Accounts WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
        res.json(banks);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch bank accounts" });
    }
};

exports.linkBank = async (req, res) => {
    const { bankName, accountType } = req.body;
    const last4 = Math.floor(1000 + Math.random() * 9000).toString(); // Simulated random last 4

    try {
        await db.query(
            "INSERT INTO Bank_Accounts (user_id, bank_name, account_type, account_number_last4) VALUES (?, ?, ?, ?)",
            [req.user.id, bankName, accountType, last4]
        );
        res.status(201).json({ message: `Successfully linked ${bankName} account` });
    } catch (error) {
        res.status(500).json({ message: "Failed to link bank account" });
    }
};

exports.unlinkBank = async (req, res) => {
    const { bankId } = req.params;
    const userId = req.user.id;

    try {
        const [result] = await db.query("DELETE FROM Bank_Accounts WHERE bank_account_id = ? AND user_id = ?", [bankId, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Bank account not found" });
        }
        res.json({ message: "Bank account unlinked successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to unlink bank account" });
    }
};
