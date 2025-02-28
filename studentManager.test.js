const { StudentManager, Student } = require('./studentManager');
const { localStorageMock } = require('./setup.test.js');

describe('StudentManager', () => {
    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
    });
  
    test('initialize StudentManager with an empty list', () => {
      const studentManager = new StudentManager();
      expect(studentManager.students).toEqual([]);
    });
  
    test('add a new student', () => {
      const studentManager = new StudentManager();
      const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
      
      studentManager.addStudent(student);
      
      expect(studentManager.students.length).toBe(1);
      expect(studentManager.students[0].mssv).toBe('1234');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('students', JSON.stringify([student]));
    });
  
    test('update student information', () => {
      const studentManager = new StudentManager();
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
      const studentManager = new StudentManager();
      const student = new Student('1234', 'Nguyễn Văn A', '2000-01-01', 'Nam', 'CNTT', 2020, 'Đại học', 'Hà Nội', 'a@gmail.com', '0123456789', 'Đang học');
      
      studentManager.addStudent(student);
      
      const results = studentManager.searchStudents('Nguyễn');
      
      expect(results.length).toBe(1);
      expect(results[0].mssv).toBe('1234');
    });
  
    test('search students with filters', () => {
      const studentManager = new StudentManager();
      const student1 = new Student('5678', 'Trần Thị B', '2001-02-02', 'Nữ', 'CNTT', 2021, 'Đại học', 'HCM', 'b@gmail.com', '0987654321', 'Đang học');
      
      studentManager.addStudent(student1);
      
      const results = studentManager.searchStudents('', {
        gender: 'Nữ',
        department: 'CNTT'
      });
      
      expect(results.length).toBe(1);
      expect(results[0].mssv).toBe('5678');
    });
});