// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect } = require('./config/db');

const app = express();

// Initialize database connection first
connect()
  .then(() => {
    console.log('Database connected successfully');
    
    // Then set up middleware and routes
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Routes
    const authRoutes = require('./routes/authRoutes');
    const enrollRoutes = require('./routes/enrollRoutes');
    const studentRoutes = require('./routes/studentRoutes');
    
    app.use('/api/auth', authRoutes);
    app.use('/api/enrollments', enrollRoutes);
    app.use('/api/students', studentRoutes);

    // Error handling middleware
    const { errorHandler } = require('./middleware/auth');
    app.use(errorHandler);

    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });