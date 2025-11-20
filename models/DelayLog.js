const { DataTypes } = require("sequelize");

const DelayLog = (sequelize) => {
  return sequelize.define("DelayLog", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    expected_delay_min: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "delay_logs",
    timestamps: false,
  });
};

module.exports = DelayLog;

// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const DelayLog = sequelize.define("DelayLog", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   expected_delay_min: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   created_at: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
// }, {
//   tableName: "delay_logs",
//   timestamps: false,
// });

// module.exports = DelayLog;