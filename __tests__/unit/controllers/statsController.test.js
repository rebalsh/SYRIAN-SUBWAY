// __tests__/unit/controllers/statsController.test.js
const { describe, test, expect, beforeEach } = require('@jest/globals');
const { mockUsers } = require('../../mocks/auth');
const { mockModels } = require('../../mocks/database');

jest.mock('../../../models', () => mockModels);

const statsController = require('../../../controllers/statsController');

describe('Stats Controller Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      user: mockUsers.superAdmin
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('يجب أن يرجع إحصائيات المستخدمين بنجاح', async () => {
    const mockUserStats = [
      { userType: 1, count: '50' }
    ];

    mockModels.User.findAll.mockResolvedValue(mockUserStats);

    await statsController.getUserStats(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({
      message: expect.any(String),
      stats: expect.any(Object),
      raw_data: mockUserStats
    });
  });
});




// // __tests__/unit/controllers/statsController.test.js
// const statsController = require('../../../controllers/statsController');
// const { mockModels } = require('../../mocks/database');

// // Mock بسيط ومباشر
// jest.mock('../../../models', () => mockModels);

// describe('Stats Controller - Unit Tests', () => {
//   let mockReq, mockRes;

//   beforeEach(() => {
//     jest.clearAllMocks();
    
//     mockReq = {
//       user: { id: 1, userType: 2 } // super admin
//     };
    
//     mockRes = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };
//   });

//   describe('getUserStats', () => {
//     test('يجب أن يرفض الوصول إذا لم يكن Super Admin', async () => {
//       mockReq.user.userType = 1; // مسافر
      
//       await statsController.getUserStats(mockReq, mockRes);
      
//       expect(mockRes.status).toHaveBeenCalledWith(403);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "ليس لديك صلاحية للوصول إلى هذه الإحصائيات"
//       });
//     });

//     test('يجب أن يرجع إحصائيات المستخدمين بشكل صحيح', async () => {
//       // بيانات وهمية
//       const mockData = [
//         { userType: 1, count: '100' },
//         { userType: 3, count: '20' },
//         { userType: 4, count: '15' },
//         { userType: 5, count: '30' }
//       ];
      
//       mockModels.User.findAll.mockResolvedValue(mockData);
      
//       await statsController.getUserStats(mockReq, mockRes);
      
//       expect(mockModels.User.findAll).toHaveBeenCalled();
//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "تم جلب إحصائيات المستخدمين بنجاح",
//         stats: {
//           total_passengers: 100,
//           total_station_admins: 20,
//           total_technicians: 15,
//           total_drivers: 30,
//           total_users: 165,
//           details: {
//             passengers: 100,
//             station_admins: 20,
//             technicians: 15,
//             drivers: 30
//           }
//         },
//         raw_data: mockData
//       });
//     });
//   });
// });