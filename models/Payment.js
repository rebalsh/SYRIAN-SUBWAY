const { DataTypes } = require("sequelize");

const Payment = (sequelize) => {
  return sequelize.define("Payment", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM("1", "2"),
      allowNull: false,
    },
  }, {
    tableName: "payments",
    timestamps: false,
  });
};

module.exports = Payment;
//  const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const Payment = sequelize.define("Payment", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   amount: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   timestamp: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   method: {
//     type: DataTypes.ENUM("1", "2"),
//     allowNull: false,
//   },
// }, {
//   tableName: "payments",
//   timestamps: false,
// });

// module.exports = Payment;