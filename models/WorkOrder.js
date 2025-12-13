// const { DataTypes } = require("sequelize");

// const WorkOrder = (sequelize) => {
//   return sequelize.define("WorkOrder", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     status: {
//       type: DataTypes.ENUM("accept", "reject"),
//       allowNull: false,
//     },
//     created_at: {
//       type: DataTypes.DATE,
//       allowNull: false,
//     },
//     resolved_at: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//   }, {
//     tableName: "work_orders",
//     timestamps: false,
//   });
// };

// module.exports = WorkOrder;



// *****************************************************************************
const { DataTypes } = require("sequelize");

const WorkOrder = (sequelize) => {
  return sequelize.define("WorkOrder", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fault_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    technician_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected", "completed"),
      allowNull: false,
      defaultValue: "pending",
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    accepted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estimated_completion_time: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  }, {
    tableName: "work_orders",
    timestamps: false,
  });
};

module.exports = WorkOrder;