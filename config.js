let appConfig = {};

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error('Không thể tải tập tin cấu hình');
        }
        appConfig = await response.json();
        
        initializeFormWithConfig();
    } catch (error) {
        console.error('Lỗi khi tải cấu hình:', error);
        alert('Không thể tải cấu hình ứng dụng. Vui lòng làm mới trang.');
    }
}

function initializeFormWithConfig() {
    const statusSelect = document.getElementById('status');
    if (statusSelect && appConfig.statusValidation) {
        statusSelect.innerHTML = '';
        appConfig.statusValidation.defaultStatuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });
    }
    
}

function validateEmail(email) {
    if (!email || email.trim() === '') return { valid: false, message: 'Email không được để trống' };

    if (appConfig.emailValidation?.enabled) {
        const domains = appConfig.emailValidation.domains;
        const match = email.match(/@student\.(.+)\.edu\.vn$/i);
        if (!match || !domains.includes(match[1].toLowerCase())) {
            return {
                valid: false,
                message: 'Email phải có dạng @student.university.edu.vn với university là: ' + domains.join(', ')
            };
        }
        return { valid: true };
    } else {
        if (/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
            return { valid: true };
        } else {
            return { valid: false, message: 'Email phải có đuôi @gmail.com' };
        }
    }
}

function validatePhone(phone) {
    if (!phone || phone.trim() === '') return { valid: false, message: 'Số điện thoại không được để trống' };

    if (appConfig.phoneValidation?.enabled) {
        let isValid = false;
        const validFormats = [];

        if (appConfig.phoneValidation.patterns) {
            for (const [country, patternInfo] of Object.entries(appConfig.phoneValidation.patterns)) {
                const regex = new RegExp(patternInfo.regex);
                if (regex.test(phone)) {
                    isValid = true;
                    break;
                }
                validFormats.push(`${patternInfo.name} (VD: ${patternInfo.example})`);
            }

            if (!isValid) {
                return {
                    valid: false,
                    message: 'Số điện thoại không hợp lệ. Định dạng được chấp nhận: ' + validFormats.join(', ')
                };
            }
        }
        return { valid: true };
    } else {
        if (/^\d+$/.test(phone)) {
            return { valid: true };
        } else {
            return { valid: false, message: 'Số điện thoại chỉ được chứa chữ số' };
        }
    }
}

function validateStatusTransition(currentStatus, newStatus) {
    if (currentStatus === newStatus) return { valid: true };

    if (appConfig.statusValidation?.enabled) {
        const allowedTransitions = appConfig.statusValidation.transitions[currentStatus] || [];

        if (!allowedTransitions.includes(newStatus)) {
            return {
                valid: false,
                message: `Không thể chuyển trạng thái từ "${currentStatus}" sang "${newStatus}"`
            };
        }
        return { valid: true };
    }

    return { valid: true };
}