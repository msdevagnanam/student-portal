const { getConnection } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

class User {
    static async create({ name, email, password }) {
        // Validate input
        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }
        
        if (!validator.isEmail(email)) {
            throw new Error('Invalid email format');
        }
        
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters');
        }
        
        // Check if user already exists
        const connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (rows.length > 0) {
            throw new Error('Email already registered');
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        
        return result.insertId;
    }
    
    static async findByCredentials(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        
        const connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (rows.length === 0) {
            throw new Error('Invalid email or password');
        }
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        
        return user;
    }
    
    static async generateAuthToken(userId) {
        const token = jwt.sign({ id: userId }, process.env.JWT_SECRET || 'your-secret-key', {
            expiresIn: '7d'
        });
        
        const connection = await getConnection();
        await connection.execute(
            'UPDATE users SET token = ? WHERE id = ?',
            [token, userId]
        );
        
        return token;
    }
    
    static async findByToken(token) {
        if (!token) {
            throw new Error('Authentication token is required');
        }
        
        const connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT id, name, email FROM users WHERE token = ?',
            [token]
        );
        
        if (rows.length === 0) {
            throw new Error('Invalid authentication token');
        }
        
        return rows[0];
    }
    
    static async logout(userId) {
        const connection = await getConnection();
        await connection.execute(
            'UPDATE users SET token = NULL WHERE id = ?',
            [userId]
        );
    }
}

module.exports = User;