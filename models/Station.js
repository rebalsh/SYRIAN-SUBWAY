const { DataTypes } = require("sequelize");

const Station = (sequelize) => {
  return sequelize.define("Station", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: "stations",
    timestamps: false,
  });
};

module.exports = Station;
//  const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const Station = sequelize.define("Station", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   name: {
//     type: DataTypes.STRING(100),
//     allowNull: false,
//   },
//   location: {
//     type: DataTypes.STRING(255),
//     allowNull: false,
//   },
// }, {
//   tableName: "stations",
//   timestamps: false,
// });

// module.exports = Station;