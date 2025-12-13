

// *****************************************************************************************
const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define("Trip", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    line_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    train_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("on", "off"),
      allowNull: false,
      defaultValue: "off",
    },
    passenger_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    // 🔴 الحقول الجديدة المضافة
    is_auto_generated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    is_disabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    discount_type: {
      type: DataTypes.ENUM('none', 'weekly', 'monthly'),
      defaultValue: 'none',
      allowNull: false
    }
  }, {
    tableName: "trips",
    timestamps: false,
  });

  return Trip;
};





















// const { DataTypes } = require("sequelize");

// module.exports = (sequelize, DataTypes) => {
//   const Trip = sequelize.define("Trip", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     driver_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     line_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     train_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     start_time: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     end_time: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     status: {
//       type: DataTypes.ENUM("on", "off"),
//       allowNull: false,
//       defaultValue: "off",
//     },
//     passenger_count: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       defaultValue: 0,
//     },
//   }, {
//     tableName: "trips",
//     timestamps: false,
//   });

//   return Trip;
// };