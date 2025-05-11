const express = require('express');
const { auth } = require('../middleware/auth');
const { createEnrollment } = require('../controllers/enrollController');

const router = express.Router();

router.post('/', auth, createEnrollment);

module.exports = router;