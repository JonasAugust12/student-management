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
            categoryManager.updateCategory(type, oldValue, newValue);
            categoryManager.displayCategories();
            location.reload();
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