// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const Ticket = sequelize.define("Ticket", {
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
//     },
//     // 🔴 الحقول الجديدة المضافة
//     discount_type: {
//       type: DataTypes.ENUM('none', 'weekly', 'monthly'),
//       defaultValue: 'none',
//       allowNull: false
//     },
//     discount_percentage: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//       allowNull: false
//     },
//     is_monthly_pass: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//     },
//     is_weekly_pass: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//     },
//     original_price: {
//       type: DataTypes.DECIMAL(10, 2)
//     },
//     seat_number: {
//       type: DataTypes.STRING(50),
//       allowNull: true
//     }
//   }, {
//     tableName: "tickets",
//     timestamps: false,
//   });

//   return Ticket;
// };


// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const Ticket = sequelize.define("Ticket", {
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
//       allowNull: true,  // غيرتها لـ true عشان الحجز الشهري
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
//     },
//     discount_type: {
//       type: DataTypes.ENUM('none', 'weekly', 'monthly'),
//       defaultValue: 'none',
//       allowNull: false
//     },
//     discount_percentage: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0,
//       allowNull: false
//     },
//     subscription_type: {
//       type: DataTypes.ENUM('none', 'weekly', 'monthly'),
//       defaultValue: 'none',
//       allowNull: false
//     },
//     parent_ticket_id: {
//       type: DataTypes.INTEGER,
//       allowNull: true
//     },
//     subscription_start_date: {
//       type: DataTypes.DATE,
//       allowNull: true
//     },
//     subscription_end_date: {
//       type: DataTypes.DATE,
//       allowNull: true
//     },
//     subscription_days: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0
//     },
//     is_weekly_pass: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//     },
//     is_monthly_pass: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: false
//     },
//     original_price: {
//       type: DataTypes.DECIMAL(10, 2)
//     }
//   }, {
//     tableName: "tickets",
//     timestamps: false,
//   });

//   return Ticket;
// };








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
      allowNull: true,  // تبقى true للتذاكر الدورية
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
      type: DataTypes.TEXT, // غيرناها لـ TEXT لأن QR كبير
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

    // ============ الحقول للخصم ============
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
    original_price: {
      type: DataTypes.DECIMAL(10, 2)
    },

    // ============ الحقول للتذاكر الدورية ============
    is_periodic_ticket: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    periodic_ticket_number: {
      type: DataTypes.STRING(100)
    },
    periodic_base_trip_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    periodic_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    periodic_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    is_weekly_pass: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_monthly_pass: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    // ============ حقول إضافية ============
    payment_reference: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    confirmed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    }

  }, {
    tableName: "tickets",
    timestamps: false,
  });

  return Ticket;
};