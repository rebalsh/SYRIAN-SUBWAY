const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Ticket = sequelize.define("Ticket", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    line_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from_station_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    to_station_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    total_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    qr_code: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled", "used"),
      allowNull: false,
      defaultValue: "pending",
    },
    ticket_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    // 🔴 الحقول الجديدة المضافة
    discount_type: {
      type: DataTypes.ENUM('none', 'weekly', 'monthly'),
      defaultValue: 'none',
      allowNull: false
    },
    discount_percentage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    is_monthly_pass: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_weekly_pass: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    original_price: {
      type: DataTypes.DECIMAL(10, 2)
    },
    seat_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    tableName: "tickets",
    timestamps: false,
  });

  return Ticket;
};



// models/Ticket.js
// models/Ticket.js








// const { DataTypes } = require("sequelize");

// const Ticket = (sequelize) => {
//   return sequelize.define("Ticket", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     user_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     trip_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     line_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     from_station_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     to_station_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     purchase_date: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW
//     },
//     price: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//     },
//     quantity: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 1,
//     },
//     total_price: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//     },
//     qr_code: {
//       type: DataTypes.STRING(500),
//       allowNull: true,
//     },
//     status: {
//       type: DataTypes.ENUM("pending", "confirmed", "cancelled", "used"),
//       allowNull: false,
//       defaultValue: "pending",
//     },
//     ticket_number: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     }
//   }, {
//     tableName: "tickets",
//     timestamps: false,
//   });
// };

// module.exports = Ticket;