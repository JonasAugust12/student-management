class LogManager {
    constructor() {
        this.logs = JSON.parse(localStorage.getItem('logs')) || [];
    }

    addLog(action, details) {
        const log = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            action: action,
            details: details
        };
        this.logs.unshift(log);
        this.saveToStorage();
    }

    clearLogs() {
        if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ log?')) return;
        this.logs = [];
        this.saveToStorage();
    }

    saveToStorage() {
        localStorage.setItem('logs', JSON.stringify(this.logs));
    }

    getLogs(filters = {}) {
        let filteredLogs = [...this.logs];
        
        if (filters.action) {
            filteredLogs = filteredLogs.filter(log => log.action.includes(filters.action));
        }
        if (filters.startDate) {
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) >= new Date(filters.startDate)
            );
        }
        if (filters.endDate) {
            filteredLogs = filteredLogs.filter(log => 
                new Date(log.timestamp) <= new Date(filters.endDate)
            );
        }
        
        return filteredLogs;
    }
}

const logManager = new LogManager();