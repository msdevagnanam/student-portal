const { getConnection } = require('../config/db');
const validator = require('validator');

class Enrollment {
    static async create({ studentName, dob, gender, course, semester, email, mobile, address, percentage }, userId) {
        // Validate input
        if (!studentName || !dob || !gender || !course || !semester || !email || !mobile || !address || percentage === undefined) {
            throw new Error('All fields are required');
        }
        
        // Validate email
        if (!validator.isEmail(email)) {
            throw new Error('Invalid email format');
        }
        
        // Validate mobile
        if (!validator.isMobilePhone(mobile, 'any', { strictMode: false })) {
            throw new Error('Invalid mobile number');
        }
        
        // Validate percentage
        if (percentage < 0 || percentage > 100) {
            throw new Error('Percentage must be between 0 and 100');
        }
        
        // Validate age (at least 16 years old)
        const dobDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - dobDate.getFullYear();
        const monthDiff = today.getMonth() - dobDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
            age--;
        }
        
        if (age < 16) {
            throw new Error('Student must be at least 16 years old');
        }
        
        // Validate course and semester
        if (course === 'MBA' && semester > 4) {
            throw new Error('MBA program has maximum 4 semesters');
        }
        
        if ((course === 'B.Sc' || course === 'B.Com') && semester > 6) {
            throw new Error(`${course} program has maximum 6 semesters`);
        }
        
        // Generate enrollment ID
        const courseCode = course.substring(0, 3).toUpperCase();
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const enrollmentId = `ENR-${courseCode}-${dateStr}-${randomStr}`;
        
        // Create enrollment
        const connection = await getConnection();
        const [result] = await connection.execute(
            `INSERT INTO enrollments (
                enrollment_id, student_name, dob, gender, course, semester,
                email, mobile, address, percentage, user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [enrollmentId, studentName, dob, gender, course, semester, email, mobile, address, percentage, userId]
        );
        
        return {
            id: result.insertId,
            enrollmentId,
            studentName,
            course,
            semester
        };
    }
    
    static async findByUser(userId, filters = {}) {
        let query = 'SELECT * FROM enrollments WHERE user_id = ?';
        const params = [userId];
        
        if (filters.course) {
            query += ' AND course = ?';
            params.push(filters.course);
        }
        
        if (filters.semester) {
            query += ' AND semester = ?';
            params.push(filters.semester);
        }
        
        query += ' ORDER BY student_name';
        
        const connection = await getConnection();
        const [rows] = await connection.execute(query, params);
        
        return rows;
    }

     static async updateByIdAndUser(id, userId, updateData) {
    let connection;
    try {
      connection = await getConnection();
      
      const setClause = Object.keys(updateData)
        .map(key => `${key} = ?`)
        .join(', ');
      
      const values = Object.values(updateData);
      values.push(id, userId);
      
      const [result] = await connection.execute(
        `UPDATE enrollments 
         SET ${setClause} 
         WHERE id = ? AND user_id = ?`,
        values
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      const [rows] = await connection.execute(
        'SELECT * FROM enrollments WHERE id = ?',
        [id]
      );
      
      return rows[0];
    } finally {
      if (connection) connection.release();
    }
  }
    
    static async findByIdAndUser(id, userId) {
        const connection = await getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM enrollments WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (rows.length === 0) {
            throw new Error('Enrollment not found');
        }
        
        return rows[0];
    }
    
    static async deleteByIdAndUser(id, userId) {
        const connection = await getConnection();
        const [result] = await connection.execute(
            'DELETE FROM enrollments WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        
        if (result.affectedRows === 0) {
            throw new Error('Enrollment not found');
        }
    }
}

module.exports = Enrollment;