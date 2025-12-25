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
//       defaultValue: DataTypes.NOW,
//     },
//     status: {
//       type: DataTypes.ENUM("pending", "completed", "failed", "refunded"),
//       defaultValue: "pending",
//     },
//     stripe_payment_intent_id: {
//       type: DataTypes.STRING(255),
//       allowNull: true,
//     },
//     ticket_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     user_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     }
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
    stripe_session_id: {
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
    },
    
    // 🔴 **الحقول الجديدة من الصورة**:
    customer_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    card_number_last4: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
    card_exp_month: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    card_exp_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    card_brand: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    payment_method: {
      type: DataTypes.STRING(50),
      defaultValue: "card",
    }
  }, {
    tableName: "payments",
    timestamps: false,
  });
};

module.exports = Payment;