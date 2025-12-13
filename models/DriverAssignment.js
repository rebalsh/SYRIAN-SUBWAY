const { DataTypes } = require("sequelize");

const DriverAssignment = (sequelize) => {
  return sequelize.define("DriverAssignment", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    duty_start: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duty_end: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "driver_assignments",
    timestamps: false,
  });
};

module.exports = DriverAssignment;
//  const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const DriverAssignment = sequelize.define("DriverAssignment", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   duty_start: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   duty_end: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
// }, {
//   tableName: "driver_assignments",
//   timestamps: false,
// });

// module.exports = DriverAssignment;