const { DataTypes } = require("sequelize");

const TrainLocation = (sequelize) => {
  return sequelize.define("TrainLocation", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "train_locations",
    timestamps: false,
  });
};

module.exports = TrainLocation;
//  const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const TrainLocation = sequelize.define("TrainLocation", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   latitude: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   longitude: {
//     type: DataTypes.FLOAT,
//     allowNull: false,
//   },
//   timestamp: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
// }, {
//   tableName: "train_locations",
//   timestamps: false,
// });

// module.exports = TrainLocation;