const { localStorageMock } = require('./setup.test.js');
const LogManager = require('./logManager');

describe('LogManager', () => {
    let logManager;

    const mockConfirm = jest.fn();
    global.confirm = mockConfirm;

    beforeEach(() => {
        localStorageMock.clear();
        jest.clearAllMocks();
        logManager = new LogManager();
    });

    test('initialize LogManager with an empty list', () => {
        expect(logManager.logs).toEqual([]);
    });

    test('add a new log', () => {
        const action = 'CREATE';
        const details = 'Added new student';
        
        logManager.addLog(action, details);
        
        expect(logManager.logs.length).toBe(1);
        expect(logManager.logs[0].action).toBe(action);
        expect(logManager.logs[0].details).toBe(details);
        expect(logManager.logs[0]).toHaveProperty('id');
        expect(logManager.logs[0]).toHaveProperty('timestamp');
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'logs',
            JSON.stringify(logManager.logs)
        );
    });

    test('clear all logs when confirm is true', () => {
        mockConfirm.mockReturnValue(true);
        logManager.addLog('CREATE', 'Test log');
        
        logManager.clearLogs();
        
        expect(logManager.logs).toEqual([]);
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'logs',
            JSON.stringify([])
        );
    });

    test('do not clear logs when confirm is false', () => {
        mockConfirm.mockReturnValue(false);
        logManager.addLog('CREATE', 'Test log');
        
        logManager.clearLogs();
        
        expect(logManager.logs.length).toBe(1);
        expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
            'logs',
            JSON.stringify([])
        );
    });

    test('filter logs by action', () => {
        logManager.addLog('CREATE', 'Created student');
        logManager.addLog('UPDATE', 'Updated student');
        
        const filtered = logManager.getLogs({ action: 'CREATE' });
        
        expect(filtered.length).toBe(1);
        expect(filtered[0].action).toBe('CREATE');
    });

    test('filter logs by start date', () => {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const today = new Date().toISOString();
        
        const realDate = Date;
        global.Date = class extends realDate {
            constructor() {
                return new realDate(today);
            }
        };

        logManager.addLog('CREATE', 'Today log');
        
        global.Date = class extends realDate {
            constructor() {
                return new realDate(yesterday);
            }
        };
        
        logManager.addLog('CREATE', 'Yesterday log');
        
        global.Date = realDate;
        
        const filtered = logManager.getLogs({ 
            startDate: new Date().toISOString().split('T')[0] 
        });
        
        expect(filtered.length).toBe(1);
        expect(filtered[0].details).toBe('Today log');
    });
});