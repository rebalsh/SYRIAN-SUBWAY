//   // const { DataTypes } = require("sequelize");


//   // const LineStation = (sequelize) => {
//   //   return sequelize.define("LineStation", {
//   //     id: {
//   //       type: DataTypes.INTEGER,
//   //       autoIncrement: true,
//   //       primaryKey: true,
//   //     },
//   //     station_name: {
//   //       type: DataTypes.STRING(100),
//   //       allowNull: false,
//   //     },
//   //     order: {
//   //       type: DataTypes.INTEGER,
//   //       allowNull: false,
//   //     },
//   //   }, {
//   //     tableName: "line_stations",
//   //     timestamps: false,
//   //   });
//   // };

//   // module.exports = LineStation;
// // models/LineStation.js
// const { DataTypes } = require("sequelize");

// const LineStation = (sequelize) => {
//   return sequelize.define("LineStation", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     lineId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: 'lines', key: 'id' },
//     },
//     stationId: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: 'stations', key: 'id' },
//     },
//     station_order: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     arrival_estimated: {
//       type: DataTypes.TIME,
//       allowNull: true,
//     }
//   }, {
//     tableName: "line_stations",
//     timestamps: false,
//     indexes: [
//       { unique: true, fields: ['lineId', 'stationId'] },
//       { unique: true, fields: ['lineId', 'station_order'] },
//     ]
//   });
// };

// module.exports = LineStation;

// *************************************************************************************
// const { DataTypes } = require("sequelize");

// const LineStation = (sequelize) => {
//   return sequelize.define("LineStation", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     line_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "lines",
//         key: "id"
//       }
//     },
//     station_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: {
//         model: "stations",
//         key: "id"
//       }
//     },
//     station_order: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       comment: "ترتيب المحطة في الخط"
//     },
//     arrival_time: {
//       type: DataTypes.TIME,
//       allowNull: false,
//       comment: "وقت الوصول للمحطة"
//     },
//     departure_time: {
//       type: DataTypes.TIME,
//       allowNull: false,
//       comment: "وقت المغادرة من المحطة"
//     }
//   }, {
//     tableName: "line_stations",
//     timestamps: false,
//   });
// };

// module.exports = LineStation;




// models/LineStation.js
const { DataTypes } = require("sequelize");

const LineStation = (sequelize) => {
  return sequelize.define("LineStation", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    line_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "lines",
        key: "id"
      }
    },
    station_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "stations",
        key: "id"
      }
    },
    station_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "ترتيب المحطة في الخط"
    }
    // تم إزالة arrival_time و departure_time من هنا
    // لأن الأوقات ستكون في جدول TripStopTime الخاص بكل رحلة
  }, {
    tableName: "line_stations",
    timestamps: false,
  });
};

module.exports = LineStation;