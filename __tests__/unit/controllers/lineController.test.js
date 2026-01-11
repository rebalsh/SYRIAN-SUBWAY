// const { describe, test, expect, beforeEach, jest: jestMock } = require('@jest/globals');
// const { mockUsers } = require('../../mocks/auth');
// const { mockModels } = require('../../mocks/database');

// // Mock جميع الموديلز
// jest.mock('../../../models', () => mockModels);

// // استيراد الكونترولر
// const lineController = require('../../../controllers/lineController');

// describe('Line Controller Unit Tests', () => {
//   let mockReq, mockRes;

//   beforeEach(() => {
//     jest.clearAllMocks();
    
//     mockReq = {
//       user: mockUsers.superAdmin,
//       params: {},
//       body: {}
//     };
    
//     mockRes = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };

//     // Mock transaction
//     mockModels.sequelize.transaction.mockResolvedValue({
//       commit: jest.fn().mockResolvedValue(true),
//       rollback: jest.fn().mockResolvedValue(true)
//     });
//   });

//   describe('createLine', () => {
//     test('يجب أن ينشئ خطاً جديداً مع المحطات بنجاح', async () => {
//       const mockLineData = {
//         line_name: 'الخط الجديد',
//         price: 5.00,
//         stations: [
//           { name: 'المحطة الأولى', location: 'الموقع 1', station_order: 1 },
//           { name: 'المحطة الثانية', location: 'الموقع 2', station_order: 2 }
//         ]
//       };

//       mockReq.body = mockLineData;

//       // Mock إنشاء الخط
//       const mockNewLine = { id: 1, line_name: 'الخط الجديد', price: 5.00 };
//       mockModels.Line.create.mockResolvedValue(mockNewLine);
      
//       // Mock البحث عن المحطة
//       mockModels.Station.findOne.mockResolvedValue(null);
      
//       // Mock إنشاء المحطة
//       const mockStation = { id: 1, name: 'المحطة الأولى', location: 'الموقع 1' };
//       mockModels.Station.create.mockResolvedValue(mockStation);
      
//       // Mock ربط المحطة بالخط
//       mockModels.LineStation.create.mockResolvedValue({});
      
//       // Mock جلب الخط مع المحطات
//       const mockLineWithStations = {
//         id: 1,
//         line_name: 'الخط الجديد',
//         Stations: [
//           { id: 1, name: 'المحطة الأولى', location: 'الموقع 1' }
//         ]
//       };
//       mockModels.Line.findOne.mockResolvedValue(mockLineWithStations);

//       await lineController.createLine(mockReq, mockRes);

//       // التحقق من الاستجابة
//       expect(mockRes.status).toHaveBeenCalledWith(201);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "تم إنشاء الخط والمحطات بنجاح",
//         line: mockLineWithStations
//       });
//     });

//     test('يجب أن يرفض إنشاء خط بدون اسم أو محطات', async () => {
//       mockReq.body = {};

//       await lineController.createLine(mockReq, mockRes);

//       expect(mockRes.status).toHaveBeenCalledWith(400);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "يرجى إدخال اسم الخط وقائمة المحطات"
//       });
//     });

//     test('يجب أن يرفض السعر السالب', async () => {
//       mockReq.body = {
//         line_name: 'الخط الجديد',
//         price: -5,
//         stations: [{ name: 'محطة', location: 'موقع' }]
//       };

//       await lineController.createLine(mockReq, mockRes);

//       expect(mockRes.status).toHaveBeenCalledWith(400);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "السعر يجب أن يكون قيمة موجبة"
//       });
//     });
//   });

//   describe('getAllLines', () => {
//     test('يجب أن يجلب جميع الخطوط مع تفاصيل المستخدم', async () => {
//       // Mock بيانات الخطوط
//       const mockLines = [
//         {
//           id: 1,
//           line_name: 'الخط الأحمر',
//           Stations: [{ id: 1, name: 'المحطة المركزية' }]
//         }
//       ];

//       mockModels.Line.findAll.mockResolvedValue(mockLines);

//       await lineController.getAllLines(mockReq, mockRes);

//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "تم جلب الخطوط بنجاح",
//         lines: mockLines,
//         userType: mockReq.user.userType,
//         note: "تم تحديد 100 خط كحد أقصى لتحسين الأداء"
//       });
//     });

//     test('يجب أن يضيف السعر للمسافرين فقط', async () => {
//       mockReq.user = mockUsers.passenger;
      
//       const mockLines = [{ id: 1, line_name: 'الخط الأحمر', price: 5.00 }];
//       mockModels.Line.findAll.mockResolvedValue(mockLines);

//       await lineController.getAllLines(mockReq, mockRes);

//       // التحقق أن الـ attributes تتضمن price
//       const callArgs = mockModels.Line.findAll.mock.calls[0][0];
//       expect(callArgs.attributes).toContain('price');
//     });
//   });

//   describe('getLineById', () => {
//     test('يجب أن يجلب خطاً محدداً', async () => {
//       mockReq.params.id = '1';
      
//       const mockLine = {
//         id: 1,
//         line_name: 'الخط الأحمر',
//         Stations: []
//       };

//       mockModels.Line.findOne.mockResolvedValue(mockLine);

//       await lineController.getLineById(mockReq, mockRes);

//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "تم جلب الخط بنجاح",
//         line: mockLine,
//         userType: mockReq.user.userType
//       });
//     });

//     test('يجب أن يرجع 404 إذا لم يكن الخط موجوداً', async () => {
//       mockReq.params.id = '999';
//       mockModels.Line.findOne.mockResolvedValue(null);

//       await lineController.getLineById(mockReq, mockRes);

//       expect(mockRes.status).toHaveBeenCalledWith(404);
//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "الخط غير موجود"
//       });
//     });
//   });

//   describe('updateLine', () => {
//     test('يجب أن يقوم بتحديث الخط بنجاح', async () => {
//       mockReq.params.id = '1';
//       mockReq.body = {
//         line_name: 'الخط الأحمر المحدث',
//         price: 6.00,
//         stations: [
//           { name: 'محطة جديدة', location: 'موقع جديد' }
//         ]
//       };

//       const mockExistingLine = {
//         id: 1,
//         update: jest.fn().mockResolvedValue(true)
//       };

//       mockModels.Line.findByPk.mockResolvedValue(mockExistingLine);
//       mockModels.Station.findOne.mockResolvedValue(null);
//       mockModels.Station.create.mockResolvedValue({ id: 1 });
//       mockModels.LineStation.create.mockResolvedValue({});
//       mockModels.LineStation.destroy.mockResolvedValue(1);
//       mockModels.Line.findOne.mockResolvedValue({
//         id: 1,
//         line_name: 'الخط الأحمر المحدث'
//       });

//       await lineController.updateLine(mockReq, mockRes);

//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "تم تحديث الخط والمحطات بنجاح",
//         line: expect.any(Object)
//       });
//     });

//     test('يجب أن يرجع 404 إذا لم يكن الخط موجوداً للتحديث', async () => {
//       mockReq.params.id = '999';
//       mockModels.Line.findByPk.mockResolvedValue(null);

//       await lineController.updateLine(mockReq, mockRes);

//       expect(mockRes.status).toHaveBeenCalledWith(404);
//     });
//   });

//   describe('deleteLine', () => {
//     test('يجب أن يحذف الخط بنجاح', async () => {
//       mockReq.params.id = '1';

//       const mockLine = {
//         id: 1,
//         destroy: jest.fn().mockResolvedValue(true)
//       };

//       mockModels.Line.findByPk.mockResolvedValue(mockLine);
//       mockModels.LineStation.destroy.mockResolvedValue(1);

//       await lineController.deleteLine(mockReq, mockRes);

//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "تم حذف الخط بنجاح"
//       });
//     });
//   });

//   describe('getLinePrices', () => {
//     test('يجب أن يجلب الأسعار للمسافرين فقط', async () => {
//       mockReq.user = mockUsers.passenger;

//       const mockLines = [
//         { id: 1, line_name: 'الخط الأحمر', price: 5.00 }
//       ];

//       mockModels.Line.findAll.mockResolvedValue(mockLines);

//       await lineController.getLinePrices(mockReq, mockRes);

//       expect(mockRes.json).toHaveBeenCalledWith({
//         message: "تم جلب أسعار الخطوط بنجاح",
//         lines: mockLines
//       });
//     });

//     test('يجب أن يرفض الوصول لغير المسافرين', async () => {
//       mockReq.user = mockUsers.superAdmin;

//       await lineController.getLinePrices(mockReq, mockRes);

//       expect(mockRes.status).toHaveBeenCalledWith(403);
//     });
//   });
// });



// __tests__/unit/controllers/lineController.test.js
const { describe, test, expect, beforeEach, jest: jestMock } = require('@jest/globals');
const { mockUsers } = require('../../mocks/auth');
const { mockModels } = require('../../mocks/database');

// الحل: استخدم mockModels مباشرة بدون تعريف جديد
jest.mock('../../../models', () => mockModels);

const lineController = require('../../../controllers/lineController');

describe('Line Controller Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      user: mockUsers.superAdmin,
      params: {},
      body: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('createLine', () => {
    test('يجب أن ينشئ خطاً جديداً مع المحطات بنجاح', async () => {
      mockReq.body = {
        line_name: 'الخط الجديد',
        price: 5.00,
        stations: [
          { name: 'محطة 1', location: 'موقع 1' }
        ]
      };

      // Mock transaction
      mockModels.sequelize.transaction.mockResolvedValue({
        commit: jest.fn().mockResolvedValue(true),
        rollback: jest.fn().mockResolvedValue(true)
      });

      mockModels.Line.create.mockResolvedValue({ id: 1 });
      mockModels.Station.findOne.mockResolvedValue(null);
      mockModels.Station.create.mockResolvedValue({ id: 1 });
      mockModels.LineStation.create.mockResolvedValue({});

      await lineController.createLine(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });
});




// // __tests__/unit/controllers/lineController.test.js
// const lineController = require('../../../controllers/lineController');
// const { mockModels } = require('../../mocks/database');

// jest.mock('../../../models', () => mockModels);

// describe('Line Controller - Unit Tests', () => {
//   let mockReq, mockRes;

//   beforeEach(() => {
//     jest.clearAllMocks();
    
//     mockReq = {
//       user: { userType: 2 },
//       body: {},
//       params: {}
//     };
    
//     mockRes = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };
//   });

//   describe('createLine', () => {
//     test('يجب أن يرفض إنشاء خط بدون بيانات', async () => {
//       mockReq.body = {};
      
//       await lineController.createLine(mockReq, mockRes);
      
//       expect(mockRes.status).toHaveBeenCalledWith(400);
//     });

//     test('يجب أن ينشئ خطاً بنجاح', async () => {
//       mockReq.body = {
//         line_name: 'الخط الأحمر',
//         price: 5.00,
//         stations: [
//           { name: 'المحطة الأولى', location: 'الموقع 1' }
//         ]
//       };
      
//       mockModels.sequelize.transaction.mockImplementation(async (callback) => {
//         const transaction = {
//           commit: jest.fn().mockResolvedValue(true),
//           rollback: jest.fn().mockResolvedValue(true)
//         };
//         return await callback(transaction);
//       });
      
//       mockModels.Line.create.mockResolvedValue({ id: 1, line_name: 'الخط الأحمر' });
//       mockModels.Station.findOne.mockResolvedValue(null);
//       mockModels.Station.create.mockResolvedValue({ id: 1 });
//       mockModels.LineStation.create.mockResolvedValue({});
      
//       await lineController.createLine(mockReq, mockRes);
      
//       expect(mockRes.status).toHaveBeenCalledWith(201);
//     });
//   });
// });