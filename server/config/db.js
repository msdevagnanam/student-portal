// server/config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const connect = async () => {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'student_portal',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('MySQL connection pool created');
        return pool;
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

const getConnection = () => {
    if (!pool) {
        throw new Error('Database connection pool not initialized');
    }
    return pool;
};

module.exports = { connect, getConnection };