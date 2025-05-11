// Base API URL
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    // Load students data
    loadStudents();
    
    // Filter functionality
    const applyFiltersBtn = document.getElementById('applyFilters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', function() {
            loadStudents();
        });
    }
    
    const resetFiltersBtn = document.getElementById('resetFilters');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            document.getElementById('filterCourse').value = '';
            document.getElementById('filterSemester').value = '';
            loadStudents();
        });
    }
});

async function loadStudents() {
    const courseFilter = document.getElementById('filterCourse').value;
    const semesterFilter = document.getElementById('filterSemester').value;
    
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Build query string
    let query = '';
    if (courseFilter) query += `course=${courseFilter}`;
    if (semesterFilter) query += `${query ? '&' : ''}semester=${semesterFilter}`;
    
    try {
        const response = await fetch(`${API_BASE_URL}/students?${query}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderStudentsTable(data.students);
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('An error occurred while loading students', 'error');
    }
}

function renderStudentsTable(students) {
    const tableBody = document.querySelector('#studentsTable tbody');
    tableBody.innerHTML = '';
    
    if (students.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" class="no-data">No students found</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.enrollment_id}</td>
            <td>${student.student_name}</td>
            <td>${student.course}</td>
            <td>${student.semester}</td>
            <td>${student.email}</td>
            <td>${student.mobile}</td>
            <td>
                <button class="action-btn edit-btn" data-id="${student.id}">Edit</button>
                <button class="action-btn delete-btn" data-id="${student.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const studentId = this.getAttribute('data-id');
            editStudent(studentId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const studentId = this.getAttribute('data-id');
            deleteStudent(studentId);
        });
    });
}

async function editStudent(studentId) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Response status:', response.status); // Add this line
        
        const data = await response.json();
        console.log('API response:', data); // Add this line
        
        if (data.success) {
            localStorage.setItem('editStudent', JSON.stringify(data.student));
            window.location.href = 'edit_student.html';
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        console.error('Edit student error:', error); // Add this line
        showMessage('Error fetching student details', 'error');
    }
}

// In your existing students.js file, update the editStudent function:
async function editStudent(studentId) {
    const token = localStorage.getItem('token');
    
    try {
        // Fetch student details
        const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store student data for editing
            localStorage.setItem('editStudent', JSON.stringify(data.student));
            
            // Redirect to edit page
            window.location.href = 'edit_student.html';
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Error fetching student details', 'error');
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

async function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student record?')) {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_BASE_URL}/students/${studentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Student record deleted successfully', 'success');
                loadStudents();
            } else {
                showMessage(data.message, 'error');
            }
        } catch (error) {
            showMessage('An error occurred while deleting the student', 'error');
        }
    }
}