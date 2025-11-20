// const { DataTypes } = require("sequelize");

// const Ticket = (sequelize) => {
//   return sequelize.define("Ticket", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     purchase_date: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     price: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//     },
//     qr_code: {
//       type: DataTypes.STRING(255),
//       allowNull: false,
//     },
//     status: {
//       type: DataTypes.ENUM("full", "not full"),
//       allowNull: false,
//       defaultValue: "not full",
//     },
//     ticket_num: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//   }, {
//     tableName: "tickets",
//     timestamps: false,
//   });
// };

// module.exports = Ticket;







// models/Ticket.js
// models/Ticket.js
const { DataTypes } = require("sequelize");

const Ticket = (sequelize) => {
  return sequelize.define("Ticket", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    trip_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    line_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from_station_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    to_station_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    purchase_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    total_price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    qr_code: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled", "used"),
      allowNull: false,
      defaultValue: "pending",
    },
    ticket_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
    }
  }, {
    tableName: "tickets",
    timestamps: false,
  });
};

module.exports = Ticket;