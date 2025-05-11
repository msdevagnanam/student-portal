const Enrollment = require('../models/Enrollment');
const { getConnection } = require('../config/db');

const getStudents = async (req, res) => {
    try {
        const { course, semester } = req.query;
        const filters = {};
        
        if (course) filters.course = course;
        if (semester) filters.semester = semester;
        
        const students = await Enrollment.findByUser(req.user.id, filters);
        
        res.json({
            success: true,
            students
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// Get single student by ID
const getStudentById = async (req, res) => {
    try {
        const student = await Enrollment.findByIdAndUser(req.params.id, req.user.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        res.json({
            success: true,
            student
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

const updateStudent = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const data = req.body;

    const connection = getConnection();
    try {
        const [result] = await connection.query(
            `UPDATE enrollments SET student_name = ?, dob = ?, gender = ?, course = ?, semester = ?, email = ?, mobile = ?, address = ?, percentage = ?
             WHERE id = ? AND user_id = ?`,
            [
                data.student_name,
                data.dob,
                data.gender,
                data.course,
                data.semester,
                data.email,
                data.mobile,
                data.address,
                data.percentage,
                id,
                userId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Student not found or not authorized." });
        }

        res.json({ success: true, student: data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};





const deleteStudent = async (req, res) => {
    try {
        await Enrollment.deleteByIdAndUser(req.params.id, req.user.id);
        
        res.json({
            success: true,
            message: 'Enrollment deleted successfully'
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = { getStudents, deleteStudent,updateStudent, getStudentById };