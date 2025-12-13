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
      allowNull: true, // إذا كان null بتكون للجميع
      references: {
        model: "users",
        key: "id"
      }
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // إذا كان null بتكون لجميع الرحلات
      references: {
        model: "trips",
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
        "emergency"
      ),
      allowNull: false,
      defaultValue: "general"
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    sent_to_all: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: "notifications",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};

module.exports = Notification;