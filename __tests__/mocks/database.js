// __tests__/mocks/database.js
const sequelizeMock = {
  transaction: jest.fn(() => ({
    commit: jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true)
  })),
  fn: jest.fn().mockImplementation((fnName) => ({
    [fnName]: jest.fn((col) => ({ fn: fnName, col }))
  })),
  col: jest.fn((colName) => colName),
  literal: jest.fn((text) => text),
  Op: {
    between: 'BETWEEN',
    in: 'IN',
    eq: '='
  },
  QueryTypes: {
    SELECT: 'SELECT'
  },
  query: jest.fn()
};

const mockModels = {
  User: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn()
  },
  Ticket: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn()
  },
  Trip: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn()
  },
  Line: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn()
  },
  Station: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn()
  },
  Train: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn()
  },
  Fault: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findByPk: jest.fn()
  },
  LineStation: {
    create: jest.fn(),
    destroy: jest.fn()
  }
};

// كائن ميرج عشان يكون عندنا sequelize داخل mockModels
const mockModelsWithSequelize = {
  ...mockModels,
  sequelize: sequelizeMock,
  Sequelize: { Op: sequelizeMock.Op }
};

module.exports = { mockModels: mockModelsWithSequelize };