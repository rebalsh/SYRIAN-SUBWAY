const { DataTypes } = require("sequelize");

const Train = (sequelize) => {
  return sequelize.define("Train", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    version_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("on", "off"),
      allowNull: false,
      defaultValue: "off",
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: "trains",
    timestamps: false,
  });
};

module.exports = Train;
//  const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const Train = sequelize.define("Train", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   version_number: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   status: {
//     type: DataTypes.ENUM("on", "off"),
//     allowNull: false,
//     defaultValue: "off",
//   },
//   capacity: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
// }, {
//   tableName: "trains",
//   timestamps: false,
// });

// module.exports = Train;