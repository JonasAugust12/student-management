const readline = require('readline');

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

    toString() {
        return `[MSSV: ${this.mssv}, Họ tên: ${this.fullname}, Ngày sinh: ${this.dob}, Giới tính: ${this.gender}, Khoa: ${this.department}, Khóa: ${this.course}, Chương trình: ${this.program}, Địa chỉ: ${this.address}, Email: ${this.email}, SĐT: ${this.phone}, Tình trạng: ${this.status}]`;
    }
}

class StudentManager {
    constructor() {
        if (!StudentManager.instance) {
            this.students = [];
            StudentManager.instance = this;
        }
        return StudentManager.instance;
    }

    addStudent(student) {
        student.mssv = this.students.length + 1;
        this.students.push(student);
        console.log("Thêm sinh viên thành công!");
    }

    removeStudent(mssv) {
        const initialLength = this.students.length;
        this.students = this.students.filter(student => student.mssv !== parseInt(mssv));
        console.log(initialLength === this.students.length ? "Không tìm thấy sinh viên để xóa!" : "Xóa sinh viên thành công!");
    }

    updateStudentMenu() {
        askQuestion("Nhập MSSV của sinh viên cần cập nhật: ")
            .then(mssv => {
                const student = this.students.find(s => s.mssv === parseInt(mssv));
                if (!student) {
                    console.log("Không tìm thấy sinh viên!");
                    return mainMenu();
                }
                console.log("Chọn thông tin cần cập nhật:");
                const fields = [
                    { key: "fullname", name: "Họ tên" },
                    { key: "dob", name: "Ngày sinh", validate: isValidDate },
                    { key: "gender", name: "Giới tính", options: validGenders },
                    { key: "department", name: "Khoa", options: validDepartments },
                    { key: "course", name: "Khóa", validate: value => /^\d{4}$/.test(value) },
                    { key: "program", name: "Chương trình" },
                    { key: "address", name: "Địa chỉ" },
                    { key: "email", name: "Email", validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) },
                    { key: "phone", name: "SĐT", validate: value => /^\d{10,11}$/.test(value) },
                    { key: "status", name: "Tình trạng", options: validStatuses }
                ];

                fields.forEach((field, index) => console.log(`${index + 1}. ${field.name}`));

                return askQuestion("Nhập số thứ tự của thông tin cần cập nhật: ", ans => ans >= 1 && ans <= fields.length)
                    .then(choice => {
                        const selectedField = fields[choice - 1];
                        
                        if (selectedField.options) {
                            console.log(`Chọn ${selectedField.name}:`);
                            selectedField.options.forEach((option, i) => console.log(`${i + 1}. ${option}`));
                            
                            return askQuestion(`Nhập số tương ứng (1-${selectedField.options.length}): `, ans => ans >= 1 && ans <= selectedField.options.length)
                                .then(optionIndex => {
                                    student[selectedField.key] = selectedField.options[optionIndex - 1];
                                    console.log("Cập nhật thành công!");
                                    mainMenu();
                                });
                        } else {
                            return askQuestion(`Nhập giá trị mới cho ${selectedField.name}: `, selectedField.validate)
                                .then(value => {
                                    student[selectedField.key] = value;
                                    console.log("Cập nhật thành công!");
                                    mainMenu();
                                });
                        }
                    });
            });
    }


    searchStudent(keyword) {
        const results = this.students.filter(student => student.mssv.toString().includes(keyword) || student.fullname.includes(keyword));
        console.log(results.length ? results.map(s => s.toString()).join('\n') : "Không tìm thấy sinh viên!");
    }

    displayStudents() {
        if (this.students.length === 0) {
            console.log("Danh sách sinh viên trống.");
        } else {
            console.log("\nDanh sách sinh viên:");
            this.students.forEach(student => console.log(student.toString()));
        }
    }
}

const validDepartments = ["Khoa Luật", "Khoa Tiếng Anh thương mại", "Khoa Tiếng Nhật", "Khoa Tiếng Pháp"];
const validStatuses = ["Đang học", "Đã tốt nghiệp", "Đã thôi học", "Tạm dừng học"];
const validGenders = ["Nam", "Nữ"];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const studentManager = new StudentManager();

function isValidDate(dob) {
    const regex = /^\d{2}[-/.]\d{2}[-/.]\d{4}$/;
    if (!regex.test(dob)) return false;
    const [day, month, year] = dob.split(/[-/.]/).map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function askQuestion(question, validation) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            if (validation && !validation(answer)) {
                console.log("Thông tin không hợp lệ! Vui lòng nhập lại.");
                resolve(askQuestion(question, validation));
            } else {
                resolve(answer);
            }
        });
    });
}

function addStudentMenu() {
    askQuestion("Nhập họ tên: ")
        .then(fullname => askQuestion("Nhập ngày sinh (dd-mm-yyyy, dd/mm/yyyy, dd.mm.yyyy): ", isValidDate)
            .then(dob => {
                console.log("Giới tính: 1. Nam  2. Nữ");
                return askQuestion("Chọn giới tính (1-2): ", ans => ans >= 1 && ans <= 2)
                    .then(gender => [fullname, dob, validGenders[gender - 1]]);
            })
        )
        .then(([fullname, dob, gender]) => {
            console.log("Danh sách khoa:");
            validDepartments.forEach((dept, index) => console.log(`${index + 1}. ${dept}`));
            return askQuestion("Chọn khoa (1-4): ", ans => ans >= 1 && ans <= 4)
                .then(department => [fullname, dob, gender, validDepartments[department - 1]]);
        })
        .then(([fullname, dob, gender, department]) => askQuestion("Nhập khóa: ", ans => /^\d{4}$/.test(ans))
            .then(course => askQuestion("Nhập chương trình: ")
                .then(program => askQuestion("Nhập địa chỉ: ")
                    .then(address => askQuestion("Nhập email: ", ans => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ans))
                        .then(email => askQuestion("Nhập số điện thoại: ", ans => /^\d{10,11}$/.test(ans))
                            .then(phone => {
                                console.log("Tình trạng sinh viên:");
                                validStatuses.forEach((status, index) => console.log(`${index + 1}. ${status}`));
                                return askQuestion("Chọn tình trạng (1-4): ", ans => ans >= 1 && ans <= 4)
                                    .then(status => {
                                        studentManager.addStudent(new Student(null, fullname, dob, gender, department, course, program, address, email, phone, validStatuses[status - 1]));
                                        mainMenu();
                                    });
                            })
                        )
                    )
                )
            )
        );
}

function mainMenu() {
    console.log("\nChương trình quản lý sinh viên");
    console.log("1. Thêm sinh viên");
    console.log("2. Xóa sinh viên");
    console.log("3. Cập nhật thông tin sinh viên");
    console.log("4. Tìm kiếm sinh viên");
    console.log("5. Xem danh sách sinh viên");
    console.log("6. Thoát");
    rl.question("Chọn một tùy chọn: ", option => {
        switch (option) {
            case "1":
                addStudentMenu();
                break;
            case "2":
                askQuestion("Nhập MSSV cần xóa: ").then(mssv => {
                    studentManager.removeStudent(mssv);
                    mainMenu();
                });
                break;
            case "3":
                studentManager.updateStudentMenu();
                break;
            case "4":
                askQuestion("Nhập MSSV hoặc tên để tìm kiếm: ").then(keyword => {
                    studentManager.searchStudent(keyword);
                    mainMenu();
                });
                break;
            case "5":
                studentManager.displayStudents();
                mainMenu();
                break;
            case "6":
                rl.close();
                break;
            default:
                console.log("Lựa chọn không hợp lệ! Vui lòng nhập lại.");
                mainMenu();
        }
    });
}

mainMenu();
