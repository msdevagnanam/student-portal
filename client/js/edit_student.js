document.addEventListener('DOMContentLoaded', function() {
    // Load student data from localStorage
    const studentData = JSON.parse(localStorage.getItem('editStudent'));
    
    if (!studentData) {
        showMessage('No student data found for editing. Redirecting...', 'error');
        setTimeout(() => window.location.href = 'view_students.html', 2000);
        return;
    }
    
    // Populate form fields
    document.getElementById('studentId').value = studentData.id;
    document.getElementById('studentName').value = studentData.student_name;
    document.getElementById('dob').value = studentData.dob.split('T')[0]; // Format date for input
    document.getElementById('gender').value = studentData.gender;
    document.getElementById('course').value = studentData.course;
    document.getElementById('semester').value = studentData.semester;
    document.getElementById('email').value = studentData.email;
    document.getElementById('mobile').value = studentData.mobile;
    document.getElementById('address').value = studentData.address;
    document.getElementById('percentage').value = studentData.percentage;
    
    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Cancel button
    document.getElementById('cancelEdit').addEventListener('click', function() {
        localStorage.removeItem('editStudent');
        window.location.href = 'view_students.html';
    });
    
    // Form submission
    document.getElementById('editStudentForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            await updateStudent();
        }
    });
    
    // Validation listeners
    document.getElementById('dob').addEventListener('change', validateAge);
    document.getElementById('course').addEventListener('change', validateCourseSemester);
    document.getElementById('semester').addEventListener('change', validateCourseSemester);
}

async function updateStudent() {
    const formData = {
        id: document.getElementById('studentId').value,
        student_name: document.getElementById('studentName').value,
        dob: document.getElementById('dob').value,
        gender: document.getElementById('gender').value,
        course: document.getElementById('course').value,
        semester: document.getElementById('semester').value,
        email: document.getElementById('email').value,
        mobile: document.getElementById('mobile').value,
        address: document.getElementById('address').value,
        percentage: parseFloat(document.getElementById('percentage').value)
    };
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/${formData.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('Student updated successfully!', 'success');
            localStorage.removeItem('editStudent');
            setTimeout(() => window.location.href = 'view_students.html', 1500);
        } else {
            showMessage(data.message, 'error');
        }
    } catch (error) {
        showMessage('Error updating student: ' + error.message, 'error');
    }
}

// Validation functions (similar to enroll.js)
function validateForm() {
    const requiredFields = ['studentName', 'dob', 'gender', 'course', 'semester', 'email', 'mobile', 'address', 'percentage'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.style.borderColor = 'red';
            isValid = false;
        } else {
            field.style.borderColor = '#ddd';
        }
    });
    
    if (!isValid) {
        showMessage('Please fill all required fields', 'error');
        return false;
    }
    
    if (!validateAge()) return false;
    if (!validateCourseSemester()) return false;
    
    const percentage = parseFloat(document.getElementById('percentage').value);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        document.getElementById('percentage').style.borderColor = 'red';
        showMessage('Percentage must be between 0 and 100', 'error');
        return false;
    }
    
    const email = document.getElementById('email').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('email').style.borderColor = 'red';
        showMessage('Please enter a valid email address', 'error');
        return false;
    }
    
    const mobile = document.getElementById('mobile').value;
    if (!/^\d{10,15}$/.test(mobile)) {
        document.getElementById('mobile').style.borderColor = 'red';
        showMessage('Please enter a valid mobile number (10-15 digits)', 'error');
        return false;
    }
    
    return true;
}

function validateAge() {
    const dobInput = document.getElementById('dob');
    const dob = new Date(dobInput.value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    
    if (age < 16) {
        dobInput.style.borderColor = 'red';
        showMessage('Student must be at least 16 years old', 'error');
        return false;
    }
    
    dobInput.style.borderColor = '#ddd';
    return true;
}

function validateCourseSemester() {
    const course = document.getElementById('course').value;
    const semester = document.getElementById('semester').value;
    const semesterSelect = document.getElementById('semester');
    
    // Reset options
    for (let i = 1; i <= 8; i++) {
        const option = semesterSelect.querySelector(`option[value="${i}"]`);
        if (option) option.disabled = false;
    }
    
    if (course === 'MBA' && semester > 4) {
        document.getElementById('semester').style.borderColor = 'red';
        showMessage('MBA program has maximum 4 semesters', 'error');
        
        // Disable invalid options
        for (let i = 5; i <= 8; i++) {
            const option = semesterSelect.querySelector(`option[value="${i}"]`);
            if (option) option.disabled = true;
        }
        
        return false;
    } else if ((course === 'B.Sc' || course === 'B.Com') && semester > 6) {
        document.getElementById('semester').style.borderColor = 'red';
        showMessage(`${course} program has maximum 6 semesters`, 'error');
        
        // Disable invalid options
        for (let i = 7; i <= 8; i++) {
            const option = semesterSelect.querySelector(`option[value="${i}"]`);
            if (option) option.disabled = true;
        }
        
        return false;
    }
    
    document.getElementById('semester').style.borderColor = '#ddd';
    return true;
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