const express = require('express');
const { auth } = require('../middleware/auth');
const {   getStudents, 
    getStudentById, 
    updateStudent, 
    deleteStudent  } = require('../controllers/studentController');

const router = express.Router();

router.get('/', auth, getStudents);
router.delete('/:id', auth, deleteStudent);
router.put('/:id', auth, updateStudent);
router.get('/:id', auth, getStudentById);

module.exports = router;