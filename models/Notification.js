// const { DataTypes } = require("sequelize");

// const Notification = (sequelize) => {
//   return sequelize.define("Notification", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     message: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     date: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//   }, {
//     tableName: "notifications",
//     timestamps: false,
//   });
// };

// module.exports = Notification;
// models/Notification.js






// const { DataTypes } = require("sequelize");

// const Notification = (sequelize) => {
//   return sequelize.define("Notification", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     user_id: {
//       type: DataTypes.INTEGER,
//       allowNull: true, // إذا كان null بتكون للجميع
//       references: {
//         model: "users",
//         key: "id"
//       }
//     },
//     trip_id: {
//       type: DataTypes.INTEGER,
//       allowNull: true, // إذا كان null بتكون لجميع الرحلات
//       references: {
//         model: "trips",
//         key: "id"
//       }
//     },
//     title: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//     message: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//     },
//     type: {
//       type: DataTypes.ENUM(
//         "delay", 
//         "cancellation", 
//         "general", 
//         "trip_update",
//         "emergency"
//       ),
//       allowNull: false,
//       defaultValue: "general"
//     },
//     date: {
//       type: DataTypes.DATE,
//       allowNull: false,
//       defaultValue: DataTypes.NOW
//     },
//     is_read: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false
//     },
//     sent_to_all: {
//       type: DataTypes.BOOLEAN,
//       allowNull: false,
//       defaultValue: false
//     }
//   }, {
//     tableName: "notifications",
//     timestamps: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at'
//   });
// };

// module.exports = Notification;












const { DataTypes } = require("sequelize");

const Notification = (sequelize) => {
  return sequelize.define("Notification", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id"
      }
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "trips",
        key: "id"
      }
    },
    ticket_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "tickets",
        key: "id"
      }
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "delay", 
        "cancellation", 
        "general", 
        "trip_update",
        "emergency",
        "driver",
        "technician",
        "station_admin",
        "system"
      ),
      allowNull: false,
      defaultValue: "general"
    },
    user_type: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "1: مسافر, 2: سوبر أدمن, 3: مشرف محطة, 4: فني, 5: سائق"
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_broadcast: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: "إذا كان true فهذا إشعار جماعي"
    },
    notification_group: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "لتجميع الإشعارات المتشابهة لنفس المستخدم"
    }
  }, {
    tableName: "notifications",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'notification_group', 'trip_id']
        // ✅ حذف where نهائياً
      }
    ]
  });
};

module.exports = Notification;