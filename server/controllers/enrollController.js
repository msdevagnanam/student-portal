const Enrollment = require('../models/Enrollment');

const createEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.create(req.body, req.user.id);
        
        res.status(201).json({
            success: true,
            message: 'Enrollment successful',
            enrollment
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = { createEnrollment };