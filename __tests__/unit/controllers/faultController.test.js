// __tests__/unit/controllers/faultController.test.js - الإصلاح النهائي
const { describe, test, expect, beforeEach } = require('@jest/globals');
const { mockUsers } = require('../../mocks/auth');
const { mockModels } = require('../../mocks/database');

jest.mock('../../../models', () => mockModels);

const faultController = require('../../../controllers/faultController');

describe('Fault Controller Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      user: mockUsers.driver, // استخدم الـ mock من auth.js
      body: {},
      params: {},
      query: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  test('يجب أن يرفض غير السائقين من الإبلاغ', async () => {
    // ⭐ الحل: ضبط المستخدم ليكون مسافر (userType = 1) وليس سائق
    mockReq.user = { ...mockUsers.passenger }; // مسافر
    
    mockReq.body = { 
      description: 'مشكلة', 
      train_id: 1 
    };

    // ⭐ خلي القطار موجود عشان ما يرفض 404
    mockModels.Train.findByPk.mockResolvedValue({ 
      id: 1,
      update: jest.fn()
    });

    await faultController.reportFault(mockReq, mockRes);

    // ⭐ الآن راح يرجع 403
    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "صلاحيات غير كافية. فقط السائقون يمكنهم الإبلاغ عن الأعطال"
    });
  });

  test('يجب أن يبلغ السائق عن عطل بنجاح', async () => {
    mockReq.user = mockUsers.driver; // سائق
    mockReq.body = {
      description: 'مشكلة في المحرك',
      train_id: 1
    };

    mockModels.Train.findByPk.mockResolvedValue({
      id: 1,
      update: jest.fn()
    });

    mockModels.Fault.create.mockResolvedValue({
      id: 100,
      description: 'مشكلة في المحرك',
      status: 'reported'
    });

    await faultController.reportFault(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: expect.stringContaining('تم الإبلاغ'),
      fault: expect.any(Object)
    });
  });
});



// // __tests__/unit/controllers/faultController.test.js
// const faultController = require('../../../controllers/faultController');
// const { mockModels } = require('../../mocks/database');

// jest.mock('../../../models', () => mockModels);

// describe('Fault Controller - Unit Tests', () => {
//   let mockReq, mockRes;

//   beforeEach(() => {
//     jest.clearAllMocks();
    
//     mockReq = {
//       user: { id: 1, userType: 5 },
//       body: {},
//       params: {}
//     };
    
//     mockRes = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };
//   });

//   test('يجب أن يرفض غير السائقين من الإبلاغ', async () => {
//     mockReq.user.userType = 1; // مسافر
//     mockReq.body = { description: 'مشكلة', train_id: 1 };
    
//     await faultController.reportFault(mockReq, mockRes);
    
//     expect(mockRes.status).toHaveBeenCalledWith(403);
//   });

//   test('يجب أن يبلغ السائق عن عطل بنجاح', async () => {
//     mockModels.Train.findByPk.mockResolvedValue({
//       id: 1,
//       update: jest.fn()
//     });
    
//     mockModels.Fault.create.mockResolvedValue({
//       id: 100,
//       description: 'مشكلة في المحرك'
//     });
    
//     await faultController.reportFault(mockReq, mockRes);
    
//     expect(mockRes.status).toHaveBeenCalledWith(201);
//   });
// });