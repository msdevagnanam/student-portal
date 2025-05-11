const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        
        if (!token) {
            throw new Error();
        }
        
        const user = await User.findByToken(token);
        
        req.token = token;
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            message: 'Please authenticate'
        });
    }
};

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
};

module.exports = { auth, errorHandler };