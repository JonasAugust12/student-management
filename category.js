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

        const list = this[type + 's'];
        if (list.includes(value)) return false;

        list.push(value);
        this.saveToStorage(type);
        return true;
    }

    removeCategory(type, value) {
        const list = this[type + 's'];
        const index = list.indexOf(value);
        if (index > -1) {
            list.splice(index, 1);
            this.saveToStorage(type);
            return true;
        }
        return false;
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
            logManager.addLog('Thêm danh mục', {
                type: type,
                value: value
            });
        }
        return success;
    }

    removeCategory(type, value) {
        const success = super.removeCategory(type, value);
        if (success) {
            logManager.addLog('Xóa danh mục', {
                type: type,
                value: value
            });
        }
        return success;
    }
}

const categoryManager = new CategoryManagerWithLogging();

function addCategory(type) {
    const input = document.getElementById(`new-${type}`);
    const value = input.value;
    if (categoryManager.addCategory(type, value)) {
        input.value = '';
        categoryManager.displayCategories();
    } else {
        alert('Danh mục này đã tồn tại hoặc không hợp lệ!');
    }
}

function deleteCategory(type, value) {
    if (confirm(`Bạn có chắc muốn xóa "${value}" không?`)) {
        if (categoryManager.removeCategory(type, value)) {
            categoryManager.displayCategories();
        }
    }
}

function updateCategory(type, oldValue) {
    const categoryItem = document.querySelector(`.category-name[data-value="${oldValue}"]`);
    if (!categoryItem) return;

    const parent = categoryItem.parentElement;
    const btnGroup = parent.querySelector(".btn-group");

    // Ẩn nút sửa và xóa
    const updateBtn = btnGroup.querySelector(".update-btn");
    const deleteBtn = btnGroup.querySelector(".delete-btn");
    updateBtn.style.display = "none";
    deleteBtn.style.display = "none";

    // Tạo input thay thế span
    const input = document.createElement("input");
    input.type = "text";
    input.value = oldValue;
    input.classList.add("edit-input");

    // Tạo nút xác nhận
    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Xác nhận";
    confirmBtn.classList.add("confirm-btn");

    // Tạo nút hủy
    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Hủy";
    cancelBtn.classList.add("cancel-btn");

    // Xác nhận chỉnh sửa
    function confirmEdit() {
        const newValue = input.value.trim();
        if (!newValue || newValue === oldValue) {
            cancelEdit();
            return;
        }

        if (confirm(`Bạn có muốn đổi "${oldValue}" thành "${newValue}" không?`)) {
            categoryManager.removeCategory(type, oldValue);
            categoryManager.addCategory(type, newValue);
            categoryManager.displayCategories();
        } else {
            cancelEdit();
        }
    }

    // Hủy chỉnh sửa
    function cancelEdit() {
        parent.replaceChild(categoryItem, input);
        btnGroup.replaceChild(updateBtn, confirmBtn);
        btnGroup.replaceChild(deleteBtn, cancelBtn);
        updateBtn.style.display = "inline-block";
        deleteBtn.style.display = "inline-block";
    }

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") confirmEdit();
        if (e.key === "Escape") cancelEdit();
    });

    confirmBtn.addEventListener("click", confirmEdit);
    cancelBtn.addEventListener("click", cancelEdit);

    // Thay thế span bằng input
    parent.replaceChild(input, categoryItem);

    // Thêm nút xác nhận & hủy vào btn-group
    btnGroup.appendChild(confirmBtn);
    btnGroup.appendChild(cancelBtn);

    input.focus();
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
        }
    });
});

// Khởi tạo dữ liệu
categoryManager.updateFormSelects();
categoryManager.displayCategories();