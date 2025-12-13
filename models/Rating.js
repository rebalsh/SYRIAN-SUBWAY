const { DataTypes } = require("sequelize");

const Rating = (sequelize) => {
  return sequelize.define("Rating", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rating_value: {
      type: DataTypes.ENUM("1", "2", "3", "4", "5"),
      allowNull: false,
    },
  }, {
    tableName: "ratings",
    timestamps: false,
  });
};

module.exports = Rating;
// const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db");

// const Rating = sequelize.define("Rating", {
//   id: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true,
//   },
//   rating_value: {
//     type: DataTypes.ENUM("1", "2", "3", "4", "5"),
//     allowNull: false,
//   },
// }, {
//   tableName: "ratings",
//   timestamps: false,
// });

// module.exports = Rating;