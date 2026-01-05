// const express = require("express");
// const router = express.Router();
// const stationController = require("../controllers/stationController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // 🔹 جميع المستخدمين يمكنهم رؤية المحطات
// router.get("/", authMiddleware, stationController.getAllStations);
// router.get("/:id", authMiddleware, stationController.getStationById);
// router.get("/:id/lines", authMiddleware, stationController.getStationLines);

// // 🔹 فقط المسؤول (userType=2) يمكنه إدارة المحطات - التعديل هنا
// router.post("/", 
//   authMiddleware, 
//   roleMiddleware([2]), // المسؤول فقط (تم التغيير من [3] إلى [2])
//   stationController.createStation
// );

// router.put("/:id", 
//   authMiddleware, 
//   roleMiddleware([2]), // المسؤول فقط (تم التغيير من [3] إلى [2])
//   stationController.updateStation
// );

// router.delete("/:id", 
//   authMiddleware, 
//   roleMiddleware([2]), // المسؤول فقط (تم التغيير من [3] إلى [2])
//   stationController.deleteStation
// );

// module.exports = router;



// **********************************************************************************



// const express = require("express");
// const router = express.Router();
// const stationController = require("../controllers/stationController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // 🔹 جميع المستخدمين يمكنهم رؤية المحطات
// router.get("/", authMiddleware, stationController.getAllStations);
// router.get("/:id", authMiddleware, stationController.getStationById);
// router.get("/:id/lines", authMiddleware, stationController.getStationLines);

// // 🔹 فقط المسؤول (userType=2) يمكنه إدارة المحطات
// router.post("/", 
//   authMiddleware, 
//   roleMiddleware([2]),
//   stationController.createStation
// );

// router.put("/:id", 
//   authMiddleware, 
//   roleMiddleware([2]),
//   stationController.updateStation
// );

// router.delete("/:id", 
//   authMiddleware, 
//   roleMiddleware([2]),
//   stationController.deleteStation
// );

// module.exports = router;



const express = require("express");
const router = express.Router();
const stationController = require("../controllers/stationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
// 🔴 أضف هذا السطر فقط
const cacheMiddleware = require("../middleware/cacheMiddleware");

// 🔹 جميع المستخدمين يمكنهم رؤية المحطات
// 🔴 أضف cacheMiddleware هنا
router.get("/", 
  authMiddleware, 
  cacheMiddleware(1800), // 30 دقيقة
  stationController.getAllStations
);

// 🔴 أضف cacheMiddleware هنا
router.get("/:id", 
  authMiddleware, 
  cacheMiddleware(1800), // 30 دقيقة
  stationController.getStationById
);

// 🔴 أضف cacheMiddleware هنا
router.get("/:id/lines", 
  authMiddleware, 
  cacheMiddleware(1800), // 30 دقيقة
  stationController.getStationLines
);

// 🔹 فقط المسؤول (userType=2) يمكنه إدارة المحطات
// 🔴 هنا ما نحتاج cacheMiddleware لأنها POST, PUT, DELETE
router.post("/", 
  authMiddleware, 
  roleMiddleware([2]),
  stationController.createStation
);

router.put("/:id", 
  authMiddleware, 
  roleMiddleware([2]),
  stationController.updateStation
);

router.delete("/:id", 
  authMiddleware, 
  roleMiddleware([2]),
  stationController.deleteStation
);

module.exports = router;