// const { Sequelize } = require("sequelize");
// const dotenv = require("dotenv");

// dotenv.config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST,
//     dialect: "mysql",
//     logging: false,
//   }
// );

// module.exports = sequelize;




// config/db.js
const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    // 🔴 أضفنا Connection Pooling
    pool: {
      max: 20,
      min: 2,
      acquire: 30000,
      idle: 10000
    }
  }
);

// اختبار الاتصال عند التشغيل
sequelize.authenticate()
  .then(() => console.log('✅ Connected to MySQL database'))
  .catch(err => console.error('❌ Database connection failed:', err.message));

module.exports = sequelize;