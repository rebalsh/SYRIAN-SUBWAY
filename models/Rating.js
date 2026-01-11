// models/Rating.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Rating = sequelize.define("Rating", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'trips',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    rating_value: {
      type: DataTypes.ENUM("1", "2", "3", "4", "5"),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    }
  }, {
    tableName: "ratings",
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ['trip_id', 'user_id']
      },
      {
        fields: ['trip_id']
      },
      {
        fields: ['user_id']
      }
    ]
  });

  return Rating;
};






// const { DataTypes } = require("sequelize");

// const Rating = (sequelize) => {
//   return sequelize.define("Rating", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     rating_value: {
//       type: DataTypes.ENUM("1", "2", "3", "4", "5"),
//       allowNull: false,
//     },
//   }, {
//     tableName: "ratings",
//     timestamps: false,
//   });
// };

// module.exports = Rating;





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