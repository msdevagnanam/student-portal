const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const userId = await User.create({ name, email, password });
        const token = await User.generateAuthToken(userId);
        
        res.status(201).json({
            success: true,
            token,
            user: {
                id: userId,
                name,
                email
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findByCredentials(email, password);
        const token = await User.generateAuthToken(user.id);
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

const logout = async (req, res) => {
    try {
        await User.logout(req.user.id);
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = { register, login, logout };