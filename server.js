// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { sequelize } = require("./models");

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // استدعاء الراوترات
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);

// app.get("/", (req, res) => {
//   res.send("🚇 Metro Backend is running...");
// });

// const startServer = async () => {
//   try {
//     // مزامنة قاعدة البيانات
//     await sequelize.sync({ alter: true });
//     console.log("✅ Database synced successfully");
    
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Error starting server:", err);
//     process.exit(1);
//   }
// };

// startServer();
// *************************************************************************************************************************


// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { sequelize } = require("./models");
// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// // استدعاء الراوترات
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const lineRoutes = require("./routes/lineRoutes");
// const stationRoutes = require("./routes/stationRoutes");

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/lines", lineRoutes);
// app.use("/api/stations", stationRoutes);

// app.get("/", (req, res) => {
//   res.send("🚇 Metro Backend is running...");
// });

// const startServer = async () => {
//   try {
//     // 🔥 استخدم force: true لأول مرة فقط لحل المشكلة
//     await sequelize.sync({ force: false });
    
//     console.log("✅ Database tables created successfully");
    
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Error starting server:", err);
//     process.exit(1);
//   }
// };

// startServer();

// ***********************************************************************************************************
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { sequelize } = require("./models");
// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// // استدعاء الراوترات
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const lineRoutes = require("./routes/lineRoutes");
// const stationRoutes = require("./routes/stationRoutes");
// const trainRoutes = require("./routes/trainRoutes");

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/lines", lineRoutes);
// app.use("/api/stations", stationRoutes);
// app.use("/api/trains", trainRoutes);

// app.get("/", (req, res) => {
//   res.send("🚇 Metro Backend is running...");
// });

// const startServer = async () => {
//   try {
//     await sequelize.sync({ force: false });
//     console.log("✅ Database tables created successfully");
    
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Error starting server:", err);
//     process.exit(1);
//   }
// };

// startServer();

// ***********************************************************************


// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { sequelize } = require("./models");
// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// // استدعاء الراوترات
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const lineRoutes = require("./routes/lineRoutes");
// const stationRoutes = require("./routes/stationRoutes");
// const trainRoutes = require("./routes/trainRoutes");
// const tripRoutes = require("./routes/tripRoutes"); // ✅ إضافة راوتر الرحلات

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/lines", lineRoutes);
// app.use("/api/stations", stationRoutes);
// app.use("/api/trains", trainRoutes);
// app.use("/api/trips", tripRoutes); // ✅ إضافة راوتر الرحلات

// app.get("/", (req, res) => {
//   res.send("🚇 Metro Backend is running...");
// });

// const startServer = async () => {
//   try {
//     await sequelize.sync({ force: false });
//     console.log("✅ Database tables created successfully");
    
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Error starting server:", err);
//     process.exit(1);
//   }
// };

// startServer();


// ***********************************************************************
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { sequelize } = require("./models");
// const app = express();

// app.use(cors());
// app.use(bodyParser.json());

// // استدعاء الراوترات
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const lineRoutes = require("./routes/lineRoutes");
// const stationRoutes = require("./routes/stationRoutes");
// const trainRoutes = require("./routes/trainRoutes");
// const tripRoutes = require("./routes/tripRoutes");
// const faultRoutes = require("./routes/faultRoutes"); // ✅ إضافة راوتر الأعطال
// const workOrderRoutes = require("./routes/workOrderRoutes"); // ✅ إضافة راوتر أوامر العمل

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/lines", lineRoutes);
// app.use("/api/stations", stationRoutes);
// app.use("/api/trains", trainRoutes);
// app.use("/api/trips", tripRoutes);
// app.use("/api/faults", faultRoutes); // ✅ إضافة راوتر الأعطال
// app.use("/api/work-orders", workOrderRoutes); // ✅ إضافة راوتر أوامر العمل

// app.get("/", (req, res) => {
//   res.send("🚇 Metro Backend is running...");
// });

// const startServer = async () => {
//   try {
//     await sequelize.sync({ force: false });
//     console.log("✅ Database tables created successfully");
    
//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Error starting server:", err);
//     process.exit(1);
//   }
// };

// startServer();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize } = require("./models");
const app = express();

app.use(cors());
app.use(bodyParser.json());

// استدعاء الراوترات
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const lineRoutes = require("./routes/lineRoutes");
const stationRoutes = require("./routes/stationRoutes");
const trainRoutes = require("./routes/trainRoutes");
const tripRoutes = require("./routes/tripRoutes");
const faultRoutes = require("./routes/faultRoutes");
const workOrderRoutes = require("./routes/workOrderRoutes");
const ticketRoutes = require("./routes/ticketRoutes"); // إضافة راوتر التذاكر

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lines", lineRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/faults", faultRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/tickets", ticketRoutes); // إضافة راوتر التذاكر

app.get("/", (req, res) => {
  res.send("🚇 Metro Backend is running...");
});

const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
        console.log("✅ Database tables created successfully");


    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  }
};

startServer();