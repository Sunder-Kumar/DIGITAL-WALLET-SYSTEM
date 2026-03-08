const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = process.env.DATABASE_URL || {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

pool.getConnection()
    .then(conn => {
        console.log("Connected to MySQL Database");
        conn.release();
    })
    .catch(err => {
        console.error("Database connection failed:", err);
    });

module.exports = pool;
