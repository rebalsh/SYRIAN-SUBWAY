const jwt = require('jsonwebtoken');

// Mock لـ jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(() => 'mock-jwt-token')
}));

// Mock user object للاختبارات
const mockUsers = {
  superAdmin: {
    id: 1,
    email: 'superadmin@metro.com',
    userType: 2,
    username: 'superadmin'
  },
  stationAdmin: {
    id: 2,
    email: 'stationadmin@metro.com',
    userType: 3,
    username: 'station_admin'
  },
  passenger: {
    id: 3,
    email: 'passenger@metro.com',
    userType: 1,
    username: 'passenger'
  },
  technician: {
    id: 4,
    email: 'technician@metro.com',
    userType: 4,
    username: 'technician'
  },
  driver: {
    id: 5,
    email: 'driver@metro.com',
    userType: 5,
    username: 'driver'
  }
};

// Mock للـ middleware
const mockAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'غير مصرح بالوصول' });
  }
  
  // اختصار: نجعل كل الاختبارات تمرر
  req.user = mockUsers.superAdmin; // الافتراضي
  next();
};

const mockRoleMiddleware = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user || !allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({ 
        message: 'ليس لديك صلاحية للوصول' 
      });
    }
    next();
  };
};

module.exports = {
  jwt,
  mockUsers,
  mockAuthMiddleware,
  mockRoleMiddleware
};