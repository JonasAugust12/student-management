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

class StudentManagerWithLogging extends StudentManager {
    addStudent(student) {
        const newStudent = super.addStudent(student);
        logManager.addLog('Thêm sinh viên', {
            mssv: newStudent.mssv
        });
        return newStudent;
    }

    removeStudent(mssv) {
        const student = this.students.find(s => s.mssv === parseInt(mssv));
        if (student) {
            logManager.addLog('Xóa sinh viên', {
                mssv: student.mssv
            });
        }
        super.removeStudent(mssv);
    }

    updateStudent(mssv, updatedData) {
        const oldData = this.students.find(s => s.mssv === parseInt(mssv));
        const success = super.updateStudent(mssv, updatedData);
        if (success) {
            logManager.addLog('Cập nhật sinh viên', {
                mssv: mssv
            });
        }
        return success;
    }
}

const studentManager = new StudentManagerWithLogging();

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
            document.getElementById('cancelEdit').style.display = "none";
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
        document.getElementById('cancelEdit').style.display = "none";
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
            <td >
                <div class="btn-group">
                    <button onclick="editStudent(${student.mssv})" >Sửa</button>
                    <button onclick="deleteStudent(${student.mssv})" style="background-color: red;">Xóa</button>
                </div>
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

    document.getElementById('cancelEdit').style.display = "inline-block";
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
if (document.getElementById('searchButton')) {
    document.getElementById('searchButton').addEventListener('click', searchStudents);
}
if (document.getElementById('filterGender')) {
    document.getElementById('filterGender').addEventListener('change', searchStudents);
}
if (document.getElementById('filterDepartment')) {
    document.getElementById('filterDepartment').addEventListener('change', searchStudents);
}
if (document.getElementById('filterCourse')) {
    document.getElementById('filterCourse').addEventListener('input', searchStudents);
}
if (document.getElementById('filterProgram')) {
    document.getElementById('filterProgram').addEventListener('change', searchStudents);
}
if (document.getElementById('filterStatus')) {
    document.getElementById('filterStatus').addEventListener('change', searchStudents);
}

function exportToCSV() {
    if (studentManager.students.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
    }

    const headers = "MSSV,Họ và tên,Ngày sinh,Giới tính,Khoa,Khóa,Chương trình,Địa chỉ,Email,Điện thoại,Trạng thái\n";
    const rows = studentManager.students.map(student =>
        `${student.mssv},"${student.fullname}",${student.dob},${student.gender},${student.department},${student.course},${student.program},"${student.address}",${student.email},${student.phone},${student.status}`
    ).join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "students.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Function to import students from CSV
function importFromCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const csvData = e.target.result;
        const lines = csvData.split("\n").slice(1); // Skip header
        const newStudents = [];

        lines.forEach(line => {
            if (!line.trim()) return; // Skip empty lines
            const [mssv, fullname, dob, gender, department, course, program, address, email, phone, status] = line.split(",");
            const student = new Student(
                parseInt(mssv),
                fullname.replace(/"/g, ''), // Remove quotes if present
                dob,
                gender,
                department,
                parseInt(course),
                program,
                address.replace(/"/g, ''),
                email,
                phone,
                status
            );
            newStudents.push(student);
        });

        newStudents.forEach(student => studentManager.addStudent(student));
        displayStudents();
        alert("Nhập sinh viên từ CSV thành công!");
    };

    reader.readAsText(file);
}

// Add buttons for export & import in the UI
if (document.getElementById('exportCSVButton')) {
    document.getElementById("exportCSVButton").addEventListener("click", exportToCSV);
}
if (document.getElementById('importCSVInput')) {
    document.getElementById("importCSVInput").addEventListener("change", importFromCSV);
}

if (document.getElementById('cancelEdit')) {
    document.getElementById('cancelEdit').addEventListener('click', () => {
        const form = document.getElementById('studentForm');
        form.reset();
        form.dataset.editMode = "false";
        form.dataset.studentId = "";
        document.querySelector('#studentForm button[type="submit"]').textContent = "Thêm Sinh Viên";
        document.getElementById('cancelEdit').style.display = "none"; // Ẩn nút hủy
    });
}

// Xuất JSON
if (document.getElementById('exportJSONButton')) {
    document.getElementById('exportJSONButton').addEventListener('click', () => {
        console.log(studentManager.students);
        const dataStr = JSON.stringify(studentManager.students, null, 4);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'students.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

// Nhập JSON
if (document.getElementById('importJSONInput')) {
    document.getElementById('importJSONInput').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    data.forEach(student => studentManager.addStudent(new Student(
                        student.mssv, student.fullname, student.dob, student.gender,
                        student.department, student.course, student.program, student.address,
                        student.email, student.phone, student.status
                    )));
                    displayStudents();
                    alert('Nhập JSON thành công!');
                } else {
                    alert('File không hợp lệ!');
                }
            } catch (error) {
                alert('Lỗi khi đọc file JSON!');
            }
        };
        reader.readAsText(file);
    });
}

// Bấm nút để mở file JSON
if (document.getElementById('importJSONButton')) {
    document.getElementById('importJSONButton').addEventListener('click', () => {
        document.getElementById('importJSONInput').click();
    });
}

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');

        if (button.dataset.tab === 'list') {
            displayStudents();
        } else if (button.dataset.tab === 'categories') {
            categoryManager.displayCategories();
        } else if (button.dataset.tab === 'logs') {
            displayLogs(); // Hiển thị log khi mở tab
        }
    });
});

// Initial display
displayStudents();