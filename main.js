// Set up event listeners after DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    
    // Tab switching
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
                displayLogs();
            }
        });
    });

    // Add validation for email and phone fields
    const emailInput = document.getElementById('email');
    const emailError = document.querySelector('.email-error');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.querySelector('.phone-error');
    
    // MSSV validation
    const mssvInput = document.getElementById('mssv');
    const mssvError = document.querySelector('.mssv-error');

    // Status validation
    const statusSelect = document.getElementById('status');
    const statusError = document.querySelector('.status-error');

    // MSSV validation function
    mssvInput.addEventListener('blur', validateMSSV);

    function validateMSSV() {
        const mssv = mssvInput.value.trim();
        if (mssv === '') return;
        
        // Convert to number for consistent comparison
        const mssvNum = parseInt(mssv);
        
        // Get current student ID if in edit mode
        const form = document.getElementById('studentForm');
        const isEditMode = form.dataset.editMode === "true";
        const currentId = isEditMode ? parseInt(form.dataset.studentId) : null;
        
        // Check if MSSV already exists
        if (studentManager.isIdExists(mssvNum.toString(), currentId?.toString())) {
            mssvError.textContent = 'MSSV này đã tồn tại trong hệ thống. Vui lòng nhập MSSV khác.';
            mssvError.style.display = 'block';
            mssvInput.classList.add('error-input');
            return false;
        } else {
            mssvError.style.display = 'none';
            mssvInput.classList.remove('error-input');
            return true;
        }
    }

    // Email validation
    emailInput.addEventListener('blur', function() {
        const email = emailInput.value.trim();
        if (email === '') return;
        
        const result = validateEmail(email);
        if (!result.valid) {
            emailError.textContent = result.message;
            emailError.style.display = 'block';
            emailInput.classList.add('error-input');
            return false;
        } else {
            emailError.style.display = 'none';
            emailInput.classList.remove('error-input');
            return true;
        }
    });

    // Phone validation
    phoneInput.addEventListener('blur', function() {
        const phone = phoneInput.value.trim();
        if (phone === '') return;
        
        const result = validatePhone(phone);
        if (!result.valid) {
            phoneError.textContent = result.message;
            phoneError.style.display = 'block';
            phoneInput.classList.add('error-input');
            return false;
        } else {
            phoneError.style.display = 'none';
            phoneInput.classList.remove('error-input');
            return true;
        }
    });

    // Status validation for edit mode
    document.getElementById('studentForm').addEventListener('change', (e) => {
        if (e.target.id === 'status' && e.target.form.dataset.editMode === "true") {
            validateStatusChange();
        }
    });

    function validateStatusChange() {
        const form = document.getElementById('studentForm');
        if (form.dataset.editMode !== "true") return true;

        const newStatus = statusSelect.value;
        const studentId = parseInt(form.dataset.studentId);
        const student = studentManager.getStudent(studentId);
        
        if (!student) return true;
        
        const currentStatus = student.status;
        
        const result = validateStatusTransition(currentStatus, newStatus);
        if (!result.valid) {
            statusError.textContent = result.message;
            statusError.style.display = 'block';
            statusSelect.classList.add('error-input');
            return false;
        } else {
            statusError.style.display = 'none';
            statusSelect.classList.remove('error-input');
            return true;
        }
    }

    // Add CSS for error highlighting
    const style = document.createElement('style');
    style.textContent = `
        .error-input {
            border: 1px solid red !important;
            background-color: #fff0f0 !important;
        }
    `;
    document.head.appendChild(style);

    // Form submission
    document.getElementById('studentForm').addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Form submitted');
        // Kiểm tra hợp lệ trước khi submit
        const isEmailValid = emailInput.value.trim() === '' || validateEmail(emailInput.value.trim()).valid;
        const isPhoneValid = phoneInput.value.trim() === '' || validatePhone(phoneInput.value.trim()).valid;
        const isMssvValid = validateMSSV();
        
        let isStatusValid = true;
        if (e.target.dataset.editMode === "true") {
            isStatusValid = validateStatusChange();
        }
        console.log(isEmailValid, isPhoneValid, isMssvValid, isStatusValid);
        if (!isEmailValid || !isPhoneValid || !isMssvValid || !isStatusValid && !isEditMode) {
            return;
        }
        
        const form = e.target;
        const isEditMode = form.dataset.editMode === "true";
        
        const studentData = {
            mssv: document.getElementById('mssv').value,
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
            if (studentManager.updateStudent(mssv.toString(), studentData)) {
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
                studentData.mssv,
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

    // Seach
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

    // Search and filter event listeners
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

    // Export and import buttons
    if (document.getElementById('exportCSVButton')) {
        document.getElementById("exportCSVButton").addEventListener("click", exportToCSV);
    }
    if (document.getElementById('importCSVInput')) {
        document.getElementById("importCSVInput").addEventListener("change", importFromCSV);
    }
    if (document.getElementById('exportJSONButton')) {
        document.getElementById('exportJSONButton').addEventListener('click', exportToJSON);
    }
    if (document.getElementById('importJSONInput')) {
        document.getElementById('importJSONInput').addEventListener('change', importFromJSON);
    }
    if (document.getElementById('importJSONButton')) {
        document.getElementById('importJSONButton').addEventListener('click', () => {
            document.getElementById('importJSONInput').click();
        });
    }

    // Cancel edit button
    if (document.getElementById('cancelEdit')) {
        document.getElementById('cancelEdit').addEventListener('click', () => {
            const form = document.getElementById('studentForm');
            form.reset();
            form.dataset.editMode = "false";
            form.dataset.studentId = "";
            document.querySelector('#studentForm button[type="submit"]').textContent = "Thêm Sinh Viên";
            document.getElementById('cancelEdit').style.display = "none";
        });
    }

    // Clear logs button
    if (document.getElementById('clearLogsButton')) {
        document.getElementById('clearLogsButton').addEventListener('click', () => {
            logManager.clearLogs();
            displayLogs();
        });
    }
    // Export logs button
    document.getElementById("exportLogsButton").addEventListener("click", exportLogsToTxt);

    //student certificate
    document.getElementById("purpose").addEventListener("change", function() {
        document.getElementById("otherPurpose").style.display = this.value === "khac" ? "block" : "none";
    });
    document.getElementById("closeOverlay").addEventListener("click", function() {
        document.getElementById("exportOverlay").style.display = "none";
    });
    document.getElementById("exportHTML").addEventListener("click", () => exportStudentData("html"));
    document.getElementById("exportMD").addEventListener("click", () => exportStudentData("md"));

    // Initialize the application
    categoryManager.updateFormSelects();
    categoryManager.displayCategories();
    displayStudents();
});