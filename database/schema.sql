CREATE DATABASE IF NOT EXISTS secure_wallet_db;
USE secure_wallet_db;

-- 1. Identity & Compliance (Pillar 2)
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    kyc_status ENUM('pending', 'verified', 'rejected', 'unverified') DEFAULT 'unverified',
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255), -- Encrypted TOTP Secret
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Double-Entry Ledger System (Pillar 1)
CREATE TABLE IF NOT EXISTS Ledger (
    entry_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    wallet_id INT NOT NULL,
    transaction_id INT NOT NULL,
    amount DECIMAL(19, 4) NOT NULL, -- Debit is negative, Credit is positive
    entry_type ENUM('debit', 'credit') NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (wallet_id),
    INDEX (transaction_id)
);

-- 3. High-Performance Wallet Cache
CREATE TABLE IF NOT EXISTS Wallets (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    balance DECIMAL(19, 4) DEFAULT 0.0000,
    currency VARCHAR(3) DEFAULT 'USD',
    tier_level ENUM('basic', 'premium') DEFAULT 'basic',
    daily_limit DECIMAL(15, 2) DEFAULT 5000.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 4. Transactions Ledger Metadata
CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_wallet_id INT,
    receiver_wallet_id INT,
    amount DECIMAL(19, 4) NOT NULL,
    transaction_type ENUM('transfer', 'deposit', 'withdrawal', 'payment') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'flagged', 'blocked') DEFAULT 'pending',
    fraud_score FLOAT DEFAULT 0.0,
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    reference_id VARCHAR(100) UNIQUE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_wallet_id) REFERENCES Wallets(wallet_id),
    FOREIGN KEY (receiver_wallet_id) REFERENCES Wallets(wallet_id)
);

-- 5. Audit & Security (Pillar 4)
CREATE TABLE IF NOT EXISTS Audit_Logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. User Verification Documents (KYC Pillar 2)
CREATE TABLE IF NOT EXISTS KYC_Documents (
    doc_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    id_type ENUM('passport', 'national_id', 'drivers_license'),
    id_number_encrypted TEXT,
    doc_url TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 7. Payment Methods (Pillar 4 Security)
CREATE TABLE IF NOT EXISTS Cards (
    card_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    card_holder_name VARCHAR(255) NOT NULL,
    brand VARCHAR(50) DEFAULT 'Visa',
    last4 VARCHAR(4) NOT NULL,
    encrypted_details TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 8. Bank Account Linking (Pillar 5 Integration)
CREATE TABLE IF NOT EXISTS Bank_Accounts (
    bank_account_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_type ENUM('checking', 'savings') DEFAULT 'checking',
    account_number_last4 VARCHAR(4) NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 9. Fraud Alerts
CREATE TABLE IF NOT EXISTS Fraud_Alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    transaction_id INT NOT NULL,
    risk_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
    details TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id)
);

-- 10. User Notifications
CREATE TABLE IF NOT EXISTS Notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);
