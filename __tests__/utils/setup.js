// Global setup للاختبارات
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

// Mock للـ console.error حتى لا تظهر الأخطاء في التقرير
global.console = {
  ...console,
  error: jest.fn()
};