const { DataTypes } = require("sequelize");

const User = (sequelize) => {
  return sequelize.define("User", {
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    username: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    userType: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    address: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    phone_number: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    emergency_phone_number: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
  }, {
    tableName: "users", // إضافة اسم الجدول
    timestamps: false   // إضافة هذا الخيار لتوحيد مع بقية المودلات
  });
};

module.exports = User;
// const { DataTypes } = require("sequelize");

// module.exports = (sequelize) => {
//   const User = sequelize.define("User", {
//     id: { 
//       type: DataTypes.INTEGER, 
//       primaryKey: true, 
//       autoIncrement: true 
//     },
//     username: { 
//       type: DataTypes.STRING, 
//       allowNull: false 
//     },
//     email: { 
//       type: DataTypes.STRING, 
//       allowNull: false, 
//       unique: true 
//     },
//     password: { 
//       type: DataTypes.STRING, 
//       allowNull: false 
//     },
//     userType: { 
//       type: DataTypes.INTEGER, 
//       allowNull: false 
//     },
//     address: { 
//       type: DataTypes.STRING, 
//       allowNull: true 
//     },
//     phone_number: { 
//       type: DataTypes.STRING, 
//       allowNull: true 
//     },
//     emergency_phone_number: { 
//       type: DataTypes.STRING, 
//       allowNull: true 
//     },
//   });

//   return User;
// };
