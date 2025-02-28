function showExportOverlay(mssv) {
    const overlay = document.getElementById("exportOverlay");
    overlay.style.display = "flex";
    overlay.setAttribute("data-student-id", mssv);
}


function displayStudents() {
    const tbody = document.querySelector('#studentTable tbody');
    tbody.innerHTML = '';

    const deletionEnabled = appConfig.deletionRestriction?.enabled ?? false;
    const timeWindow = (appConfig.deletionRestriction?.timeWindowMinutes || 30) * 60 * 1000; 

    const now = new Date().getTime();

    studentManager.students.forEach(student => {
        const createdAt = new Date(student.createdAt).getTime();
        const canDelete = !deletionEnabled || (now - createdAt <= timeWindow);

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
            <td>
                <div >
                    <div class="btn-group">
                        <button onclick="editStudent('${student.mssv}')">Sửa</button>
                    <button onclick="deleteStudent('${student.mssv}')" style="background-color: red; ${canDelete ? '' : 'opacity: 0.5; cursor: not-allowed;'}" ${canDelete ? '' : 'disabled'}>
                        Xóa
                    </button>
                    </div>
                    <button style="background-color: Green; margin-top: 5px; width: 100%" onclick="showExportOverlay('${student.mssv}')">Xuất giấy xác nhận</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });

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

function exportStudentData(format) {
    const overlay = document.getElementById("exportOverlay");
    const mssv = overlay.getAttribute("data-student-id");
    const student = studentManager.getStudent(mssv);
    
    if (!student) {
        alert("Không tìm thấy sinh viên!");
        return;
    }

    const schoolName = document.getElementById("schoolName").value;
    const schoolAddress = document.getElementById("schoolAddress").value;
    const schoolPhone = document.getElementById("schoolPhone").value;
    const schoolEmail = document.getElementById("schoolEmail").value;
    const expiryDate = document.getElementById("expiryDate").value;
    const purpose = document.getElementById("purpose").value;
    const otherPurpose = document.getElementById("otherPurpose").value.trim();

    if (!schoolName || !schoolAddress || !schoolPhone || !schoolEmail || !expiryDate) {
        alert("Vui lòng nhập đầy đủ thông tin trước khi xuất giấy xác nhận!");
        return;
    }
    if (purpose === "khac" && !otherPurpose) {
        alert("Vui lòng nhập lý do khác!");
        return;
    }
    
    let purposeText = document.querySelector(`#purpose option[value="${purpose}"]`).textContent;
    if (purpose === "khac") {
        purposeText = otherPurpose || "Không có";
    }

    if (format === "html") {
        const content = `
           <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Giấy Xác Nhận Tình Trạng Sinh Viên</title>
                    <style>
                        body {
                            font-family: "Arial", sans-serif;
                            padding: 30px;
                            line-height: 1.8;
                            background-color: #f9f9f9;
                        }

                        .container {
                            max-width: 800px;
                            margin: auto;
                            background: white;
                            padding: 30px;
                            border-radius: 10px;
                            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
                        }

                        .header, .footer {
                            text-align: center;
                            margin-bottom: 20px;
                        }

                        .header img {
                            width: 100px;
                            height: auto;
                            margin-bottom: 10px;
                        }

                        .content {
                            border: 2px solid #333;
                            padding: 20px;
                            border-radius: 5px;
                            background-color: #fff;
                        }

                        .bold {
                            font-weight: bold;
                        }

                        ul {
                            list-style: none;
                            padding: 0;
                        }

                        ul li {
                            margin: 10px 0;
                        }

                        .footer p {
                            font-style: italic;
                            margin-top: 20px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <img src="https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-DH-Khoa-Hoc-Tu-Nhien-%E2%80%93-HCMUS.png" alt="Logo Trường">
                            <h2>TRƯỜNG ĐẠI HỌC ${schoolName}</h2>
                            <p>📍 Địa chỉ: ${schoolAddress} | 📞 ${schoolPhone} | 📧 ${schoolEmail}</p>
                        </div>

                        <div class="content">
                            <h2 style="text-align: center;">GIẤY XÁC NHẬN TÌNH TRẠNG SINH VIÊN</h2>
                            <p>Trường Đại học ${schoolName} xác nhận:</p>
                            <ul>
                                <li><span class="bold">Họ và tên:</span> ${student.fullname}</li>
                                <li><span class="bold">MSSV:</span> ${student.mssv}</li>
                                <li><span class="bold">Ngày sinh:</span> ${student.dob}</li>
                                <li><span class="bold">Giới tính:</span> ${student.gender}</li>
                                <li><span class="bold">Khoa:</span> ${student.department}</li>
                                <li><span class="bold">Chương trình:</span> ${student.program}</li>
                                <li><span class="bold">Trạng thái:</span> ${student.status}</li>
                            </ul>
                            <p><span class="bold">Mục đích xác nhận:</span> ${purposeText}</p>
                            <p><span class="bold">Giấy xác nhận có hiệu lực đến:</span> ${expiryDate}</p>
                        </div>

                        <div class="footer" style="padding-bottom: 20px;">
                            <p>📅 Ngày ${new Date().toLocaleDateString()} - <strong>Đại diện trường ký tên</strong></p>
                        </div>
                    </div>
                </body>
            </html>
        `;

        const blob = new Blob([content], { type: "text/html" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `xac_nhan_sinh_vien_${student.mssv}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else if (format === "md") {
        const mdContent = `
# GIẤY XÁC NHẬN TÌNH TRẠNG SINH VIÊN

### 🏫 Trường Đại học ${schoolName} xác nhận:
- **Họ và tên:** ${student.fullname}
- **MSSV:** ${student.mssv}
- **Ngày sinh:** ${student.dob}
- **Giới tính:** ${student.gender}
- **Khoa:** ${student.department}
- **Chương trình:** ${student.program}
- **Trạng thái:** ${student.status}

### 📌 Mục đích xác nhận:
${purposeText}

### ⏳ Giấy xác nhận có hiệu lực đến:
${expiryDate}

> 📅 Ngày ${new Date().toLocaleDateString()} - **Đại diện trường ký tên**
        `;

        const blob = new Blob([mdContent], { type: "text/markdown" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `xac_nhan_sinh_vien_${student.mssv}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}
