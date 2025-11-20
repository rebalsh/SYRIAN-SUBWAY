const { DataTypes } = require("sequelize");

const TripStopTime = (sequelize) => {
  return sequelize.define("TripStopTime", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    arrival_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    departure_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: "trip_stop_times",
    timestamps: false,
  });
};

module.exports = TripStopTime;
//  const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const TripStopTime = sequelize.define("TripStopTime", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   arrival_time: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
//   departure_time: {
//     type: DataTypes.DATE,
//     allowNull: false,
//   },
// }, {
//   tableName: "trip_stop_times",
//   timestamps: false,
// });

// module.exports = TripStopTime;