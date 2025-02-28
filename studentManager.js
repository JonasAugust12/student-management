class Student {
    constructor(mssv, fullname, dob, gender, department, course, program, address, email, phone, status, createdAt = null) {
        this.mssv = mssv || '';
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
        this.createdAt = createdAt || new Date().toISOString();
    }
}

class StudentManager {
    constructor() {
        this.students = JSON.parse(localStorage.getItem('students')) || [];
    }

    isIdExists(mssv, currentId = null) {
        return this.students.some(s => s.mssv === mssv && s.mssv !== currentId);
    }

    isEmailExists(email, currentId = null) {
        return this.students.some(s => s.email === email && s.mssv !== currentId);
    }

    isPhoneExists(phone, currentId = null) {
        return this.students.some(s => s.phone === phone && s.mssv !== currentId);
    }

    getStudent(mssv) {
        return this.students.find(student => student.mssv === mssv) || null;
    }

    addStudent(student) {
        this.students.push(student);
        this.saveToStorage();
        return student;
    }

    removeStudent(mssv) {
        this.students = this.students.filter(s => s.mssv !== mssv);
        this.saveToStorage();
    }

    updateStudent(mssv, updatedData) {
        const index = this.students.findIndex(s => s.mssv ===mssv);
        if (index !== -1) {
            this.students[index] = { ...this.students[index], ...updatedData };
            this.saveToStorage();
            return true;
        }
        return false;
    }

    searchStudents(keyword = '', filters = {}) {
        let results = keyword 
            ? this.students.filter(student => 
                student.mssv.toString().includes(keyword) || 
                student.fullname.toLowerCase().includes(keyword.toLowerCase())
              )
            : [...this.students];
        
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
        logManager.addLog(`[ADD][STUDENT][ID:${newStudent.mssv}]`);
        return newStudent;
    }

    removeStudent(mssv) {
        const student = this.students.find(s => s.mssv === mssv);
        if (student) {
            logManager.addLog(`[DELETE][STUDENT][ID:${student.mssv}]`);
        }
        super.removeStudent(mssv);
    }

    updateStudent(mssv, updatedData) {
        const oldStudent = this.students.find(s => s.mssv === mssv);
        if (!oldStudent) return false;

        let changes = [];
        for (let key in updatedData) {
            if (oldStudent[key] !== updatedData[key]) {
                changes.push(`[${key.toUpperCase()}: ${updatedData[key]}]`);
            }
        }

        const success = super.updateStudent(mssv, updatedData);
        if (success && changes.length > 0) {
            logManager.addLog(`[UPDATE][STUDENT][ID:${mssv}]` + changes.join(""));
        }
        return success;
    }
}

const studentManager = new StudentManagerWithLogging();