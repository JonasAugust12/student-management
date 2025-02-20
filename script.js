class Student {
    constructor(mssv, fullname, dob, gender, department, course, program, address, email, phone, status) {
        this.mssv = mssv;
        this.fullname = fullname;
        this.dob = dob;
        this.gender = gender;
        this.department = department;
        this.course = course;
        this.program = program;
        this.address = address;
        this.email = email;
        this.phone = phone;
        this.status = status;
    }
}

class StudentManager {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
        this.nextId = Math.max(...this.students.map(s => s.mssv), 0) + 1;
    }

    addStudent(student) {
        student.mssv = this.nextId++;
        this.students.push(student);
        this.saveToStorage();
        return student;
    }

    removeStudent(mssv) {
        this.students = this.students.filter(s => s.mssv !== parseInt(mssv));
        this.saveToStorage();
    }

    updateStudent(mssv, updatedData) {
        const index = this.students.findIndex(s => s.mssv === parseInt(mssv));
        if (index !== -1) {
            this.students[index] = { ...this.students[index], ...updatedData };
            this.saveToStorage();
            return true;
        }
        return false;
    }

    searchStudents(keyword) {
        return this.students.filter(student => 
            student.mssv.toString().includes(keyword) || 
            student.fullname.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    saveToStorage() {
        localStorage.setItem('students', JSON.stringify(this.students));
    }
}

const studentManager = new StudentManager();

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
        if (button.dataset.tab === 'list') {
            displayStudents();
        }
    });
});

// Form submission
document.getElementById('studentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const student = new Student(
        null,
        document.getElementById('fullname').value,
        document.getElementById('dob').value,
        document.getElementById('gender').value,
        document.getElementById('department').value,
        document.getElementById('course').value,
        document.getElementById('program').value,
        document.getElementById('address').value,
        document.getElementById('email').value,
        document.getElementById('phone').value,
        document.getElementById('status').value
    );
    
    studentManager.addStudent(student);
    e.target.reset();
    alert('Thêm sinh viên thành công!');
});

function displayStudents() {
    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';
    studentManager.students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.mssv}</td>
            <td>${student.fullname}</td>
            <td>${student.dob}</td>
            <td>${student.gender}</td>
            <td>${student.department}</td>
            <td>
                <button onclick="editStudent(${student.mssv})">Sửa</button>
                <button onclick="deleteStudent(${student.mssv})">Xóa</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function searchStudents() {
    const keyword = document.getElementById('searchInput').value;
    const results = studentManager.searchStudents(keyword);
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>Không tìm thấy sinh viên!</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Ngày sinh</th>
                <th>Khoa</th>
                <th>Tình trạng</th>
            </tr>
        </thead>
        <tbody>
            ${results.map(student => `
                <tr>
                    <td>${student.mssv}</td>
                    <td>${student.fullname}</td>
                    <td>${student.dob}</td>
                    <td>${student.department}</td>
                    <td>${student.status}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    resultsDiv.appendChild(table);
}

function deleteStudent(mssv) {
    if (confirm('Bạn có chắc muốn xóa sinh viên này?')) {
        studentManager.removeStudent(mssv);
        displayStudents();
    }
}

function editStudent(mssv) {
    const student = studentManager.students.find(s => s.mssv === mssv);
    if (!student) return;

    // Fill the form with student data
    Object.keys(student).forEach(key => {
        const input = document.getElementById(key);
        if (input) input.value = student[key];
    });

    // Switch to add tab (which contains the form)
    document.querySelector('[data-tab="add"]').click();

    // Modify form submission to update instead of add
    const form = document.getElementById('studentForm');
    const originalSubmitHandler = form.onsubmit;
    form.onsubmit = (e) => {
        e.preventDefault();
        const updatedData = {
            fullname: document.getElementById('fullname').value,
            dob: document.getElementById('dob').value,
            gender: document.getElementById('gender').value,
            department: document.getElementById('department').value,
            course: document.getElementById('course').value,
            program: document.getElementById('program').value,
            address: document.getElementById('address').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            status: document.getElementById('status').value
        };
        
        if (studentManager.updateStudent(mssv, updatedData)) {
            alert('Cập nhật thành công!');
            form.reset();
            form.onsubmit = originalSubmitHandler;
            displayStudents();
        }
    };
}

// Initial display
displayStudents();