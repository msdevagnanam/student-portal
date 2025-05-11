// Base API URL
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    // Form validation and submission
    const enrollmentForm = document.getElementById('enrollmentForm');
    
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Get form data
            const formData = {
                studentName: document.getElementById('studentName').value,
                dob: document.getElementById('dob').value,
                gender: document.getElementById('gender').value,
                course: document.getElementById('course').value,
                semester: document.getElementById('semester').value,
                email: document.getElementById('email').value,
                mobile: document.getElementById('mobile').value,
                address: document.getElementById('address').value,
                percentage: document.getElementById('percentage').value
            };
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            
            try {
                const response = await fetch(`${API_BASE_URL}/enrollments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage('Enrollment successful! Enrollment ID: ' + data.enrollment.enrollmentId, 'success');
                    enrollmentForm.reset();
                } else {
                    showMessage(data.message, 'error');
                }
            } catch (error) {
                showMessage('An error occurred. Please try again.', 'error');
            }
        });
        
        // Add validation for date of birth
        document.getElementById('dob').addEventListener('change', function() {
            validateAge();
        });
        
        // Add validation for course and semester combo
        document.getElementById('course').addEventListener('change', function() {
            validateCourseSemester();
        });
        
        document.getElementById('semester').addEventListener('change', function() {
            validateCourseSemester();
        });
    }
});

function validateForm() {
    // Validate all required fields
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
    
    // Validate age
    if (!validateAge()) {
        return false;
    }
    
    // Validate course and semester
    if (!validateCourseSemester()) {
        return false;
    }
    
    // Validate percentage
    const percentage = parseFloat(document.getElementById('percentage').value);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        document.getElementById('percentage').style.borderColor = 'red';
        showMessage('Percentage must be between 0 and 100', 'error');
        return false;
    } else {
        document.getElementById('percentage').style.borderColor = '#ddd';
    }
    
    // Validate email
    const email = document.getElementById('email').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('email').style.borderColor = 'red';
        showMessage('Please enter a valid email address', 'error');
        return false;
    } else {
        document.getElementById('email').style.borderColor = '#ddd';
    }
    
    // Validate mobile number
    const mobile = document.getElementById('mobile').value;
    if (!/^\d{10,15}$/.test(mobile)) {
        document.getElementById('mobile').style.borderColor = 'red';
        showMessage('Please enter a valid mobile number (10-15 digits)', 'error');
        return false;
    } else {
        document.getElementById('mobile').style.borderColor = '#ddd';
    }
    
    return true;
}

function validateAge() {
    const dobInput = document.getElementById('dob');
    const dob = new Date(dobInput.value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    
    if (age < 16) {
        dobInput.style.borderColor = 'red';
        showMessage('Student must be at least 16 years old', 'error');
        return false;
    } else {
        dobInput.style.borderColor = '#ddd';
        return true;
    }
}

function validateCourseSemester() {
    const course = document.getElementById('course').value;
    const semester = document.getElementById('semester').value;
    const semesterSelect = document.getElementById('semester');
    
    // Reset options
    for (let i = 1; i <= 8; i++) {
        const option = semesterSelect.querySelector(`option[value="${i}"]`);
        if (option) {
            option.disabled = false;
        }
    }
    
    if (course === 'MBA' && semester > 4) {
        document.getElementById('semester').style.borderColor = 'red';
        showMessage('MBA program has maximum 4 semesters', 'error');
        
        // Disable invalid options
        for (let i = 5; i <= 8; i++) {
            const option = semesterSelect.querySelector(`option[value="${i}"]`);
            if (option) {
                option.disabled = true;
            }
        }
        
        return false;
    } else if ((course === 'B.Sc' || course === 'B.Com') && semester > 6) {
        document.getElementById('semester').style.borderColor = 'red';
        showMessage(`${course} program has maximum 6 semesters`, 'error');
        
        // Disable invalid options
        for (let i = 7; i <= 8; i++) {
            const option = semesterSelect.querySelector(`option[value="${i}"]`);
            if (option) {
                option.disabled = true;
            }
        }
        
        return false;
    } else {
        document.getElementById('semester').style.borderColor = '#ddd';
        return true;
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