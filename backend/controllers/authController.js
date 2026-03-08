const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const { encrypt, decrypt } = require('../utils/encryption');

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const [existingUser] = await connection.query("SELECT * FROM Users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(400).json({ message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [userResult] = await connection.query(
            "INSERT INTO Users (name, email, password_hash) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );
        const userId = userResult.insertId;

        await connection.query(
            "INSERT INTO Wallets (user_id, balance) VALUES (?, ?)",
            [userId, 0.00] 
        );

        await connection.commit();
        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        await connection.rollback();
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    } finally {
        connection.release();
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
        if (users.length === 0) return res.status(400).json({ message: "Invalid credentials" });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.user_id, role: user.role, mfa_enabled: user.mfa_enabled }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({ token, user: { id: user.user_id, name: user.name, email: user.email, role: user.role, kyc_status: user.kyc_status, mfa_enabled: !!user.mfa_enabled } });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.setup2FA = async (req, res) => {
    const secret = speakeasy.generateSecret({ name: `SecureWallet (${req.user.email})` });
    try {
        const encryptedSecret = encrypt(secret.base32);
        await db.query("UPDATE Users SET mfa_secret = ? WHERE user_id = ?", [encryptedSecret, req.user.id]);
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
        res.json({ secret: secret.base32, qrCode: qrCodeUrl });
    } catch (error) {
        res.status(500).json({ message: "MFA Setup failed" });
    }
};

exports.verify2FA = async (req, res) => {
    const { token } = req.body;
    try {
        const [users] = await db.query("SELECT mfa_secret FROM Users WHERE user_id = ?", [req.user.id]);
        const secret = decrypt(users[0].mfa_secret);
        const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token });
        if (verified) {
            await db.query("UPDATE Users SET mfa_enabled = TRUE WHERE user_id = ?", [req.user.id]);
            res.json({ message: "MFA Enabled Successfully" });
        } else {
            res.status(400).json({ message: "Invalid Code" });
        }
    } catch (error) {
        res.status(500).json({ message: "Verification failed" });
    }
};

exports.submitKYC = async (req, res) => {
    const { id_type, id_number } = req.body;
    try {
        const encryptedID = encrypt(id_number);
        await db.query(
            "INSERT INTO KYC_Documents (user_id, id_type, id_number_encrypted) VALUES (?, ?, ?)",
            [req.user.id, id_type, encryptedID]
        );
        await db.query("UPDATE Users SET kyc_status = 'pending' WHERE user_id = ?", [req.user.id]);
        res.json({ message: "Documents submitted for review" });
    } catch (error) {
        console.error("KYC Error:", error);
        res.status(500).json({ message: "KYC submission failed" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT u.user_id, u.name, u.email, u.role, u.kyc_status, w.balance 
            FROM Users u 
            LEFT JOIN Wallets w ON u.user_id = w.user_id
        `);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

exports.updateKYCStatus = async (req, res) => {
    const { userId, status } = req.body;
    try {
        await db.query("UPDATE Users SET kyc_status = ? WHERE user_id = ?", [status, userId]);
        res.json({ message: `User KYC updated to ${status}` });
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query("SELECT user_id, name, email, role, kyc_status, mfa_enabled, created_at FROM Users WHERE user_id = ?", [req.user.id]);
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
