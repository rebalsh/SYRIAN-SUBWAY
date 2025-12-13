// const { DataTypes } = require("sequelize");

// const Line = (sequelize) => {
//   return sequelize.define("Line", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     line_name: {
//       type: DataTypes.STRING(100),
//       allowNull: false,
//     },
//   }, {
//     tableName: "lines",
//     timestamps: false,
//   });
// };

// module.exports = Line;



// models/Line.js
const { DataTypes } = require("sequelize");

const Line = (sequelize) => {
  return sequelize.define("Line", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    line_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: "سعر التذكرة للخط (للمسافرين userType=1)"
    }
  }, {
    tableName: "lines",
    timestamps: false,
  });
};

module.exports = Line;