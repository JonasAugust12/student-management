class CategoryManager {
    constructor() {
        this.departments = JSON.parse(localStorage.getItem('departments')) || [
            "Khoa Luật",
            "Khoa Tiếng Anh thương mại",
            "Khoa Tiếng Nhật",
            "Khoa Tiếng Pháp"
        ];
        this.programs = JSON.parse(localStorage.getItem('programs')) || [
            "Chất lượng cao",
            "Đại trà",
            "Cử nhân tài năng",
            "Chương trình tiên tiến"
        ];
        this.statuses = JSON.parse(localStorage.getItem('statuses')) || [
            "Đang học",
            "Đã tốt nghiệp",
            "Đã thôi học",
            "Tạm dừng học"
        ];
    }

    addCategory(type, value) {
        if (!value.trim()) return false;
        if (type == 'status')
            type = 'statuse';

        const list = this[type + 's'];
        if (list.includes(value)) return false;

        list.push(value);
        this.saveToStorage(type);
        return true;
    }

    removeCategory(type, value) {
        // Check if any student is using this category
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const typeField = type === 'status' ? 'status' : type;
        
        if (students.some(student => student[typeField] === value)) {
            alert(`Không thể xóa ${value} vì có sinh viên đang sử dụng giá trị này!`);
            return false;
        }

        if (type == 'status')
            type = 'statuse';
            
        const list = this[type + 's'];
        const index = list.indexOf(value);
        if (index > -1) {
            list.splice(index, 1);
            this.saveToStorage(type);
            return true;
        }
        return false;
    }

    updateCategory(type, oldValue, newValue) {
        if (!newValue.trim() || newValue === oldValue) return false;
        
        // First update the category
        const actualType = type === 'status' ? 'statuse' : type;
        const list = this[actualType + 's'];
        const index = list.indexOf(oldValue);
        
        if (index === -1) return false;
        
        // Update all students using this category
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const typeField = type; // The actual field name in student objects
        
        let updatedStudents = false;
        
        for (let i = 0; i < students.length; i++) {
            if (students[i][typeField] === oldValue) {
                students[i][typeField] = newValue;
                console.log(students[i]);
                updatedStudents = true;
            }
        }
        
        // Save both category and students
        list[index] = newValue;
        this.saveToStorage(actualType);
        
        if (updatedStudents) {
            localStorage.setItem('students', JSON.stringify(students));
            
            // Create log entries for student updates if needed
            if (window.logManager) {
                for (const student of students.filter(s => s[typeField] === newValue)) {
                    logManager.addLog(`[UPDATE][STUDENT][ID:${student.mssv}][${typeField.toUpperCase()}: ${newValue}]`);
                }
            }
        }
        
        return true;
    }

    saveToStorage(type) {
        localStorage.setItem(type + 's', JSON.stringify(this[type + 's']));
        this.updateFormSelects();
    }

    updateFormSelects() {
        document.getElementById('department').innerHTML = this.departments
            .map(dept => `<option value="${dept}">${dept}</option>`).join('');

        document.getElementById('program').innerHTML = this.programs
            .map(prog => `<option value="${prog}">${prog}</option>`).join('');

        document.getElementById('status').innerHTML = this.statuses
            .map(status => `<option value="${status}">${status}</option>`).join('');
    }

    displayCategories() {
        document.getElementById('departments-list').innerHTML = this.departments
            .map(dept => this.createCategoryItem(dept, 'department')).join('');

        document.getElementById('programs-list').innerHTML = this.programs
            .map(prog => this.createCategoryItem(prog, 'program')).join('');

        document.getElementById('statuses-list').innerHTML = this.statuses
            .map(status => this.createCategoryItem(status, 'status')).join('');
    }

    createCategoryItem(value, type) {
        return `
            <div class="category-item">
                <span class="category-name" data-value="${value}">${value}</span>
                <div class="btn-group">
                    <button class="update-btn" onclick="updateCategory('${type}', '${value}')">Sửa</button>
                    <button class="delete-btn" onclick="deleteCategory('${type}', '${value}')">Xóa</button>
                </div>
            </div>
        `;
    }
}

class CategoryManagerWithLogging extends CategoryManager {
    addCategory(type, value) {
        const success = super.addCategory(type, value);
        if (success) {
            logManager.addLog(`[ADD][CATEGORY][TYPE:${type.toUpperCase()}][VALUE:${value}]`);
        }
        return success;
    }

    removeCategory(type, value) {
        const success = super.removeCategory(type, value);
        if (success) {
            logManager.addLog(`[DELETE][CATEGORY][TYPE:${type.toUpperCase()}][VALUE:${value}]`);
        }
        return success;
    }

    updateCategory(type, oldValue, newValue) {
        const success = super.updateCategory(type, oldValue, newValue);
        if (success) {
            logManager.addLog(`[UPDATE][CATEGORY][TYPE:${type.toUpperCase()}][OLD:${oldValue}][NEW:${newValue}]`);
        }
        return success;
    }
}

const categoryManager = new CategoryManagerWithLogging();