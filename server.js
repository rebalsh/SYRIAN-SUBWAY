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
// const faultRoutes = require("./routes/faultRoutes");
// const workOrderRoutes = require("./routes/workOrderRoutes");
// const ticketRoutes = require("./routes/ticketRoutes"); // إضافة راوتر التذاكر

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/lines", lineRoutes);
// app.use("/api/stations", stationRoutes);
// app.use("/api/trains", trainRoutes);
// app.use("/api/trips", tripRoutes);
// app.use("/api/faults", faultRoutes);
// app.use("/api/work-orders", workOrderRoutes);
// app.use("/api/tickets", ticketRoutes); // إضافة راوتر التذاكر

// app.get("/", (req, res) => {
//   res.send("🚇 Metro Backend is running...");
// });

// const startServer = async () => {
//   try {
//     await sequelize.sync({ force: false });
//         console.log("✅ Database tables created successfully");


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









/********************************************
 *      Metro Backend - Main Server
 ********************************************/

// require("dotenv").config();  // تحميل متغيرات البيئة أولاً

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
// const faultRoutes = require("./routes/faultRoutes");
// const workOrderRoutes = require("./routes/workOrderRoutes");
// const ticketRoutes = require("./routes/ticketRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// const notificationRoutes = require("./routes/notificationRoutes");







// // مسارات
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/lines", lineRoutes);
// app.use("/api/stations", stationRoutes);
// app.use("/api/trains", trainRoutes);
// app.use("/api/trips", tripRoutes);
// app.use("/api/faults", faultRoutes);
// app.use("/api/work-orders", workOrderRoutes);
// app.use("/api/tickets", ticketRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/notifications", notificationRoutes);



// app.get("/", (req, res) => {
//   res.send("🚇 Metro Backend is running...");
// });

// // تشغيل السيرفر
// const startServer = async () => {
//   try {
//     await sequelize.sync({ alter: true });

//     console.log("✅ Database connected & models synced");

//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () =>
//       console.log(`🚀 Server running on port ${PORT}`)
//     );
//   } catch (err) {
//     console.error("❌ Error starting server:", err);
//     process.exit(1);
//   }
// };

// startServer();








/********************************************
 *      Metro Backend - Main Server
 ********************************************/
// require("dotenv").config();

// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const { sequelize } = require("./models");

// const app = express();

// // 🔧 CORS middleware بسيط
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning");
//   res.header("Access-Control-Allow-Credentials", "true");
  
//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   }
  
//   next();
// });

// app.use(cors()); // CORS عادي

// app.use(bodyParser.json());

// // استدعاء الراوترات
// const authRoutes = require("./routes/authRoutes");
// const userRoutes = require("./routes/userRoutes");
// const lineRoutes = require("./routes/lineRoutes");
// const stationRoutes = require("./routes/stationRoutes");
// const trainRoutes = require("./routes/trainRoutes");
// const tripRoutes = require("./routes/tripRoutes");
// const faultRoutes = require("./routes/faultRoutes");
// const workOrderRoutes = require("./routes/workOrderRoutes");
// const ticketRoutes = require("./routes/ticketRoutes");
// const paymentRoutes = require("./routes/paymentRoutes");
// const notificationRoutes = require("./routes/notificationRoutes");

// // 🔧 مسارات API
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/lines", lineRoutes);
// app.use("/api/stations", stationRoutes);
// app.use("/api/trains", trainRoutes);
// app.use("/api/trips", tripRoutes);
// app.use("/api/faults", faultRoutes);
// app.use("/api/work-orders", workOrderRoutes);
// app.use("/api/tickets", ticketRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/notifications", notificationRoutes);

// // 🔧 صفحة الاختبار الرئيسية
// app.get("/api/health", (req, res) => {
//   console.log("Health check requested");
//   res.json({
//     status: "healthy",
//     message: "Metro Backend API is running",
//     timestamp: new Date().toISOString(),
//     endpoints: {
//       auth: "/api/auth/login",
//       trains: "/api/trains",
//       test: "/api/test"
//     }
//   });
// });

// app.get("/api/test", (req, res) => {
//   res.json({
//     success: true,
//     message: "API test successful",
//     server_time: new Date().toISOString(),
//     note: "For Flutter apps, add header: 'ngrok-skip-browser-warning': 'true'"
//   });
// });

// app.post("/api/test", (req, res) => {
//   console.log("Test POST received:", req.body);
//   res.json({
//     received: req.body,
//     message: "Data received successfully",
//     status: "ok"
//   });
// });

// // الصفحة الرئيسية
// app.get("/", (req, res) => {
//   res.send(`
//     <html>
//       <head><title>Metro API</title></head>
//       <body>
//         <h1>🚇 Metro Management System API</h1>
//         <p><strong>Status:</strong> Running ✅</p>
//         <p><strong>Endpoints:</strong></p>
//         <ul>
//           <li><a href="/api/health">/api/health</a> - Health check</li>
//           <li><a href="/api/test">/api/test</a> - Test endpoint</li>
//           <li>/api/auth/* - Authentication</li>
//           <li>/api/trains/* - Trains management</li>
//         </ul>
//         <p><strong>For Flutter/Dart:</strong> Add header <code>ngrok-skip-browser-warning: true</code></p>
//       </body>
//     </html>
//   `);
// });

// // 🔧 404 handler بدون علامة النجمة
// app.use((req, res, next) => {
//   res.status(404).json({
//     error: "Endpoint not found",
//     path: req.originalUrl,
//     method: req.method,
//     suggestion: "Try /api/health or /api/test"
//   });
// });

// // 🔧 تشغيل السيرفر
// const startServer = async () => {
//   try {
//     await sequelize.sync({ alter: true });
//     console.log("✅ Database connected & synced");

//     const PORT = process.env.PORT || 5000;
//     app.listen(PORT, () => {
//       console.log(`
// ╔════════════════════════════════════════╗
// ║  🚀 Metro Backend Server              ║
// ║  📍 Port: ${PORT}                         ║
// ║  🌐 Local: http://localhost:${PORT}       ║
// ╚════════════════════════════════════════╝
      
// 📡 Test endpoints:
//    • http://localhost:${PORT}/api/health
//    • http://localhost:${PORT}/api/test
   
// ⚠️  For ngrok access from Flutter:
//    Add this header: 'ngrok-skip-browser-warning': 'true'
//       `);
//     });
//   } catch (err) {
//     console.error("❌ Error starting server:", err);
//     console.error("Error details:", err.message);
//     process.exit(1);
//   }
// };

// startServer();








/********************************************
 *      Metro Backend - Main Server
 ********************************************/









require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize } = require("./models");

const app = express();

// 🔧 CORS middleware بسيط
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, ngrok-skip-browser-warning");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  next();
});

app.use(cors()); // CORS عادي

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
const ticketRoutes = require("./routes/ticketRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
// 🔴 الإضافة الجديدة
const autoTripRoutes = require("./routes/autoTripRoutes");

// 🔧 مسارات API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/lines", lineRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/trains", trainRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/faults", faultRoutes);
app.use("/api/work-orders", workOrderRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
// 🔴 الإضافة الجديدة
app.use("/api/auto-trips", autoTripRoutes);

// 🔧 صفحة الاختبار الرئيسية
app.get("/api/health", (req, res) => {
  console.log("Health check requested");
  res.json({
    status: "healthy",
    message: "Metro Backend API is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth/login",
      trains: "/api/trains",
      tickets: "/api/tickets/lines",
      auto_trips: "/api/auto-trips/monthly-calendar",
      test: "/api/test"
    }
  });
});

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API test successful",
    server_time: new Date().toISOString(),
    note: "For Flutter apps, add header: 'ngrok-skip-browser-warning': 'true'"
  });
});

app.post("/api/test", (req, res) => {
  console.log("Test POST received:", req.body);
  res.json({
    received: req.body,
    message: "Data received successfully",
    status: "ok"
  });
});

// الصفحة الرئيسية
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head><title>Metro API</title></head>
      <body>
        <h1>🚇 Metro Management System API</h1>
        <p><strong>Status:</strong> Running ✅</p>
        <p><strong>Endpoints:</strong></p>
        <ul>
          <li><a href="/api/health">/api/health</a> - Health check</li>
          <li><a href="/api/test">/api/test</a> - Test endpoint</li>
          <li>/api/auth/* - Authentication</li>
          <li>/api/trains/* - Trains management</li>
          <li>/api/tickets/* - Tickets booking</li>
          <li>/api/auto-trips/* - Auto trips management</li>
        </ul>
        <p><strong>For Flutter/Dart:</strong> Add header <code>ngrok-skip-browser-warning: true</code></p>
      </body>
    </html>
  `);
});

// 🔧 404 handler بدون علامة النجمة
app.use((req, res, next) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
    suggestion: "Try /api/health or /api/test"
  });
});

// 🔧 تشغيل السيرفر
const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ Database connected & synced");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  🚀 Metro Backend Server              ║
║  📍 Port: ${PORT}                         ║
║  🌐 Local: http://localhost:${PORT}       ║
╚════════════════════════════════════════╝
      
📡 Test endpoints:
   • http://localhost:${PORT}/api/health
   • http://localhost:${PORT}/api/test
   • http://localhost:${PORT}/api/tickets/lines
   • http://localhost:${PORT}/api/auto-trips/monthly-calendar
   
⚠️  For ngrok access from Flutter:
   Add this header: 'ngrok-skip-browser-warning': 'true'
      `);
    });
  } catch (err) {
    console.error("❌ Error starting server:", err);
    console.error("Error details:", err.message);
    process.exit(1);
  }
};

startServer();













