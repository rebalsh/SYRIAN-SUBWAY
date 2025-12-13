// const { DataTypes } = require("sequelize");

// const Payment = (sequelize) => {
//   return sequelize.define("Payment", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     amount: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//     },
//     timestamp: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     method: {
//       type: DataTypes.ENUM("1", "2"),
//       allowNull: false,
//     },
//   }, {
//     tableName: "payments",
//     timestamps: false,
//   });
// };

// module.exports = Payment;








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
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
      defaultValue: "pending",
    },
    stripe_payment_intent_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: "payments",
    timestamps: false,
  });
};

module.exports = Payment;