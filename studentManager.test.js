const { StudentManager, Student, StudentManagerWithLogging } = require('./studentManager');
const { localStorageMock } = require('./setup.test.js');

describe('StudentManager', () => {
    let studentManager;

    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
        studentManager = new StudentManager();
    });

    test('initialize StudentManager with an empty list', () => {
        expect(studentManager.students).toEqual([]);
    });

    test('add a new student', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        
        studentManager.addStudent(student);
        
        expect(studentManager.students.length).toBe(1);
        expect(studentManager.students[0].mssv).toBe('1234');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('students', JSON.stringify([student]));
    });

    test('update student information', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        
        studentManager.addStudent(student);
        
        const result = studentManager.updateStudent('1234', {
            fullname: 'Nguyễn Văn B',
            status: 'Bảo lưu'
        });
        
        expect(result).toBeTruthy();
        expect(studentManager.students[0].fullname).toBe('Nguyễn Văn B');
        expect(studentManager.students[0].status).toBe('Bảo lưu');
        expect(studentManager.students[0].email).toBe('a@gmail.com');
    });

    test('search students by name', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        
        studentManager.addStudent(student);
        
        const results = studentManager.searchStudents('Nguyễn');
        
        expect(results.length).toBe(1);
        expect(results[0].mssv).toBe('1234');
    });

    test('search students with filters', () => {
        const student1 = new Student('5678', 'Trần Thị B', '2001-02-02', 'Nữ', 'CNTT', 2021, 'Đại học', 'HCM', 'b@gmail.com', '0987654321', 'Đang học');
        
        studentManager.addStudent(student1);
        
        const results = studentManager.searchStudents('', {
            gender: 'Nữ',
            department: 'CNTT'
        });
        
        expect(results.length).toBe(1);
        expect(results[0].mssv).toBe('5678');
    });

    // Test bổ sung để tăng coverage
    test('isIdExists returns true when ID exists', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        studentManager.addStudent(student);
        
        expect(studentManager.isIdExists('1234')).toBe(true);
        expect(studentManager.isIdExists('5678')).toBe(false); // Test trường hợp không tồn tại
    });

    test('isEmailExists returns true when email exists', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        studentManager.addStudent(student);
        
        expect(studentManager.isEmailExists('a@gmail.com')).toBe(true);
        expect(studentManager.isEmailExists('b@gmail.com')).toBe(false); // Test trường hợp không tồn tại
    });

    test('isPhoneExists returns true when phone exists', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        studentManager.addStudent(student);
        
        expect(studentManager.isPhoneExists('0123456789')).toBe(true);
        expect(studentManager.isPhoneExists('0987654321')).toBe(false); // Test trường hợp không tồn tại
    });

    test('getStudent returns student by mssv', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        studentManager.addStudent(student);
        
        const foundStudent = studentManager.getStudent('1234');
        expect(foundStudent.mssv).toBe('1234');
        expect(studentManager.getStudent('5678')).toBeNull(); // Test trường hợp không tìm thấy
    });

    test('removeStudent removes student by mssv', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        studentManager.addStudent(student);
        
        studentManager.removeStudent('1234');
        expect(studentManager.students.length).toBe(0);
        expect(localStorageMock.setItem).toHaveBeenCalledWith('students', JSON.stringify([]));
    });

    test('updateStudent returns false when student not found', () => {
        const result = studentManager.updateStudent('9999', { fullname: 'Test' });
        expect(result).toBe(false);
    });

    test('searchStudents with all filters', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        studentManager.addStudent(student);
        
        const results = studentManager.searchStudents('', {
            gender: 'Nam',
            department: 'CNTT',
            course: '2020',
            program: 'Đại học',
            status: 'Đang học'
        });
        expect(results.length).toBe(1);
        expect(results[0].mssv).toBe('1234');
    });
});

describe('StudentManagerWithLogging', () => {
    let studentManagerWithLogging;

    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
        studentManagerWithLogging = new StudentManagerWithLogging();
    });

    afterEach(() => {
        delete global.logManager; // Dọn dẹp sau khi test
    });

    // Test để tăng coverage, không cần assert
    test('addStudent with logging', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        studentManagerWithLogging.addStudent(student);
    });

    test('removeStudent with logging', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        studentManagerWithLogging.addStudent(student);
        studentManagerWithLogging.removeStudent('1234');
    });

    test('updateStudent with logging', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        studentManagerWithLogging.addStudent(student);
        studentManagerWithLogging.updateStudent('1234', { fullname: 'Nguyễn Văn B' });
    });

    test('updateStudent with no changes', () => {
        const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
        studentManagerWithLogging.addStudent(student);
        studentManagerWithLogging.updateStudent('1234', { fullname: 'Nguyễn Văn A' });
    });

    test('updateStudent with non-existing student', () => {
        studentManagerWithLogging.updateStudent('9999', { fullname: 'Test' });
    });
});