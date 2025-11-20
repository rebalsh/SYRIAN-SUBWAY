const { DataTypes } = require("sequelize");

const Notification = (sequelize) => {
  return sequelize.define("Notification", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    message: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "notifications",
    timestamps: false,
  });
};

module.exports = Notification;
//  const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const Notification = sequelize.define("Notification", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   message: {
//     type: DataTypes.STRING(255),
//     allowNull: false,
//   },
//   date: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
// }, {
//   tableName: "notifications",
//   timestamps: false,
// });

// module.exports = Notification;