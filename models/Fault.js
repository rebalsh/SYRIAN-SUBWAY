// const { DataTypes } = require("sequelize");

// const Fault = (sequelize) => {
//   return sequelize.define("Fault", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     report_time: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     description: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     status: {
//       type: DataTypes.ENUM("working", "not working"),
//       allowNull: false,
//     },
//   }, {
//     tableName: "faults",
//     timestamps: false,
//   });
// };

// module.exports = Fault;

// ********************************************************************

const { DataTypes } = require("sequelize");

const Fault = (sequelize) => {
  return sequelize.define("Fault", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    report_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("reported", "assigned", "resolved"),
      allowNull: false,
      defaultValue: "reported",
    },
    train_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    technician_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    tableName: "faults",
    timestamps: false,
  });
};

module.exports = Fault;