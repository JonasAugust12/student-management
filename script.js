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

    searchStudents(keyword = '', filters = {}) {
        // First filter by keyword if present
        let results = keyword 
            ? this.students.filter(student => 
                student.mssv.toString().includes(keyword) || 
                student.fullname.toLowerCase().includes(keyword.toLowerCase())
              )
            : [...this.students]; // If no keyword, start with all students
        
        // Then apply filters
        return results.filter(student => {
            return (!filters.gender || student.gender === filters.gender) &&
                   (!filters.department || student.department === filters.department) &&
                   (!filters.course || student.course.toString() === filters.course) &&
                   (!filters.program || student.program === filters.program) &&
                   (!filters.status || student.status === filters.status);
        });
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
    
    const form = e.target;
    const isEditMode = form.dataset.editMode === "true";
    
    const studentData = {
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
    
    if (isEditMode) {
        const mssv = parseInt(form.dataset.studentId);
        if (studentManager.updateStudent(mssv, studentData)) {
            alert('Cập nhật thành công!');
            form.reset();
            form.dataset.editMode = "false";
            form.dataset.studentId = "";
            const submitButton = document.querySelector('#studentForm button[type="submit"]');
            submitButton.textContent = "Thêm Sinh Viên";
            displayStudents();
            document.querySelector('[data-tab="list"]').click();
        }
    } else {
        const student = new Student(
            null,
            studentData.fullname,
            studentData.dob,
            studentData.gender,
            studentData.department,
            studentData.course,
            studentData.program,
            studentData.address,
            studentData.email,
            studentData.phone,
            studentData.status
        );
        studentManager.addStudent(student);
        form.reset();
        alert('Thêm sinh viên thành công!');
        displayStudents();
    }
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
            <td>${student.course}</td>
            <td>${student.program}</td>
            <td>${student.address}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>${student.status}</td>
            <td style="display: flex; gap: 5px;">
                <button onclick="editStudent(${student.mssv})" >Sửa</button>
                <button onclick="deleteStudent(${student.mssv})" style="background-color: red;">Xóa</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    // Update filter options after displaying students
    updateFilterOptions();
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
    
    Object.keys(student).forEach(key => {
        const input = document.getElementById(key);
        if (input) input.value = student[key];
    });
    
    document.querySelector('[data-tab="add"]').click();
    const submitButton = document.querySelector('#studentForm button[type="submit"]');
    submitButton.textContent = "Cập nhật Sinh Viên";
    const form = document.getElementById('studentForm');
    form.dataset.editMode = "true";
    form.dataset.studentId = mssv;
}

// Add filter HTML to the search tab
document.getElementById('search').insertAdjacentHTML('afterbegin', `
    <div class="filter-container">
        <div class="form-group">
            <label>Giới tính:</label>
            <select id="filterGender">
                <option value="">Tất cả</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
            </select>
        </div>
        <div class="form-group">
            <label>Khoa:</label>
            <select id="filterDepartment">
                <option value="">Tất cả</option>
            </select>
        </div>
        <div class="form-group">
            <label>Khóa:</label>
            <input type="number" id="filterCourse" placeholder="VD: 2023">
        </div>
        <div class="form-group">
            <label>Chương trình:</label>
            <select id="filterProgram">
                <option value="">Tất cả</option>
            </select>
        </div>
        <div class="form-group">
            <label>Tình trạng:</label>
            <select id="filterStatus">
                <option value="">Tất cả</option>
            </select>
        </div>
    </div>
`);

// Update filter options from existing data
function updateFilterOptions() {
    const departments = new Set(studentManager.students.map(s => s.department));
    const programs = new Set(studentManager.students.map(s => s.program));
    const statuses = new Set(studentManager.students.map(s => s.status));
    
    const updateSelect = (id, values) => {
        const select = document.getElementById(id);
        const currentValue = select.value;
        select.innerHTML = '<option value="">Tất cả</option>' + 
            [...values].filter(v => v).map(v => `<option value="${v}"${currentValue === v ? ' selected' : ''}>${v}</option>`).join('');
    };
    
    updateSelect('filterDepartment', departments);
    updateSelect('filterProgram', programs);
    updateSelect('filterStatus', statuses);
}

function searchStudents() {
    const keyword = document.getElementById('searchInput').value;
    const filters = {
        gender: document.getElementById('filterGender').value,
        department: document.getElementById('filterDepartment').value,
        course: document.getElementById('filterCourse').value,
        program: document.getElementById('filterProgram').value,
        status: document.getElementById('filterStatus').value
    };

    const results = studentManager.searchStudents(keyword, filters);
    displayFilteredStudents(results);
}

function displayFilteredStudents(students) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '';

    if (students.length === 0) {
        resultsDiv.innerHTML = '<p>Không tìm thấy sinh viên!</p>';
        return;
    }

    const table = document.createElement('table');

    table.innerHTML = `
        <thead>
            <tr>
                <th>MSSV</th>
                <th>Họ và tên</th>
                <th>Ngày sinh</th>
                <th>Giới tính</th>
                <th>Khoa</th>
                <th>Khóa</th>
                <th>Chương trình</th>
                <th>Địa chỉ</th>
                <th>Email</th>
                <th>Điện thoại</th>
                <th>Trạng thái</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement('tbody');
    tbody.innerHTML = students.map(student => `
        <tr>
            <td>${student.mssv}</td>
            <td>${student.fullname}</td>
            <td>${student.dob}</td>
            <td>${student.gender}</td>
            <td>${student.department}</td>
            <td>${student.course}</td>
            <td>${student.program}</td>
            <td>${student.address}</td>
            <td>${student.email}</td>
            <td>${student.phone}</td>
            <td>${student.status}</td>
        </tr>
    `).join('');

    table.appendChild(tbody);
    resultsDiv.appendChild(table);
}

// Add event listeners for search and filters
document.getElementById('searchButton').addEventListener('click', searchStudents);
document.getElementById('filterGender').addEventListener('change', searchStudents);
document.getElementById('filterDepartment').addEventListener('change', searchStudents);
document.getElementById('filterCourse').addEventListener('input', searchStudents);
document.getElementById('filterProgram').addEventListener('change', searchStudents);
document.getElementById('filterStatus').addEventListener('change', searchStudents);

// Initial display
displayStudents();