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
        studentManager.removeStudent(mssv.toString());
        displayStudents();
    }
}

function editStudent(mssv) {
    const student = studentManager.students.find(s => s.mssv === mssv.toString());
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

function exportToJSON() {
    if (studentManager.students.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
    }
    
    const dataStr = JSON.stringify(studentManager.students, null, 4);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'students.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importFromJSON(event) {
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
}