const localStorageMock = (() => {
    let store = {};
    
    return {
      getItem: jest.fn(key => store[key] || null),
      setItem: jest.fn((key, value) => {
        store[key] = value.toString();
      }),
      clear: jest.fn(() => {
        store = {};
      }),
      removeItem: jest.fn(key => {
        delete store[key];
      })
    };
})();

Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
});

describe('localStorage mock', () => {
    test('should be defined', () => {
        expect(localStorage).toBeDefined();
    });
});

module.exports = { localStorageMock };