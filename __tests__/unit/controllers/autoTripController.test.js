// __tests__/unit/controllers/autoTripController.test.js
const { describe, test, expect, beforeEach } = require('@jest/globals');
const { mockUsers } = require('../../mocks/auth');
const { mockModels } = require('../../mocks/database');

jest.mock('../../../models', () => mockModels);

const autoTripController = require('../../../controllers/autoTripController');

describe('Auto Trip Controller Unit Tests', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      user: mockUsers.superAdmin,
      body: {},
      query: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockModels.sequelize.transaction.mockResolvedValue({
      commit: jest.fn().mockResolvedValue(true),
      rollback: jest.fn().mockResolvedValue(true)
    });
  });

  test('يجب أن ينشئ رحلات أوتوماتيكية بنجاح', async () => {
    mockReq.body = {
      line_id: 1,
      start_date: '2024-12-01',
      selected_time: '08:00',
      train_ids: [1],
      driver_ids: [3]
    };

    mockModels.Line.findByPk.mockResolvedValue({ id: 1 });
    mockModels.Train.findAll.mockResolvedValue([{ id: 1, status: 'on' }]);
    mockModels.User.findAll.mockResolvedValue([{ id: 3, userType: 5 }]);
    mockModels.Trip.findOne.mockResolvedValue(null);
    mockModels.Trip.create.mockResolvedValue({ id: 100 });

    await autoTripController.generateAutoTrips(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
  });
});