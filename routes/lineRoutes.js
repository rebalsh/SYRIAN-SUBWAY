// // routes/lineRoutes.js
// const express = require("express");
// const router = express.Router();
// const lineController = require("../controllers/lineController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // 🔹 جميع المستخدمين يمكنهم رؤية الخطوط (مع مراعاة الصلاحيات)
// router.get("/", authMiddleware, lineController.getAllLines);
// router.get("/:id", authMiddleware, lineController.getLineById);

// // 🔹 الأسعار للمسافرين فقط
// router.get("/prices/all", 
//   authMiddleware, 
//   roleMiddleware([1]), // مسافرين فقط
//   lineController.getLinePrices
// );

// // 🔹 فقط المسؤول (userType=2) يمكنه إدارة الخطوط
// router.post("/", 
//   authMiddleware, 
//   roleMiddleware(1,[2]),
//   lineController.createLine
// );

// router.put("/:id", 
//   authMiddleware, 
//   roleMiddleware([1,2]),
//   lineController.updateLine
// );

// router.patch("/:id/price", 
//   authMiddleware, 
//   roleMiddleware([2]), // مسؤول فقط
//   lineController.updateLinePrice
// );

// router.delete("/:id", 
//   authMiddleware, 
//   roleMiddleware([2]),
//   lineController.deleteLine
// );

// module.exports = router;
// *************************************************************************


// const express = require("express");
// const router = express.Router();
// const lineController = require("../controllers/lineController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");
// // 🔴 أضف هذا السطر فقط
// const cacheMiddleware = require("../middleware/cacheMiddleware");

// // 🔹 جميع المستخدمين يمكنهم رؤية الخطوط
// // 🔴 أضف cacheMiddleware هنا (كاش طويل لأن الخطوط ثابتة)
// router.get("/", 
//   authMiddleware, 
//   cacheMiddleware(1800), // 30 دقيقة
//   lineController.getAllLines
// );

// // 🔴 أضف cacheMiddleware هنا
// router.get("/:id", 
//   authMiddleware, 
//   cacheMiddleware(1800), // 30 دقيقة
//   lineController.getLineById
// );

// // 🔹 الأسعار للمسافرين فقط
// // 🔴 أضف cacheMiddleware هنا (كاش متوسط)
// router.get("/prices/all", 
//   authMiddleware, 
//   roleMiddleware([1]), // مسافرين فقط
//   cacheMiddleware(600), // 10 دقائق
//   lineController.getLinePrices
// );

// // 🔹 فقط المسؤول (userType=2) يمكنه إدارة الخطوط
// // 🔴 هنا ما نحتاج cacheMiddleware لأنها POST
// router.post("/", 
//   authMiddleware, 
//   roleMiddleware([2]), // صححت الخطأ: كان [1,2] والصحيح [2]
//   lineController.createLine
// );

// // 🔴 هنا ما نحتاج cacheMiddleware لأنها PUT
// router.put("/:id", 
//   authMiddleware, 
//   roleMiddleware([2]), // صححت الخطأ: كان [1,2] والصحيح [2]
//   lineController.updateLine
// );

// // 🔴 هنا ما نحتاج cacheMiddleware لأنها PATCH
// router.patch("/:id/price", 
//   authMiddleware, 
//   roleMiddleware([2]), // مسؤول فقط
//   lineController.updateLinePrice
// );

// // 🔴 هنا ما نحتاج cacheMiddleware لأنها DELETE
// router.delete("/:id", 
//   authMiddleware, 
//   roleMiddleware([2]),
//   lineController.deleteLine
// );

// module.exports = router;









// routes/lineRoutes.js
const express = require("express");
const router = express.Router();
const lineController = require("../controllers/lineController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const cacheMiddleware = require("../middleware/cacheMiddleware");

// 🔹 جميع المستخدمين يمكنهم رؤية الخطوط (مع كاش موحد)
router.get("/", 
  authMiddleware, 
  cacheMiddleware(1800), // 30 دقيقة
  lineController.getAllLines
);

// 🔹 Route جديد للاختبار فقط
router.get("/test/performance", 
  authMiddleware, 
  cacheMiddleware(60), // 1 دقيقة
  lineController.getLinesPerformance
);

// 🔹 جلب خط محدد
router.get("/:id", 
  authMiddleware, 
  cacheMiddleware(1800),
  lineController.getLineById
);

// 🔹 الأسعار للمسافرين فقط
router.get("/prices/all", 
  authMiddleware, 
  roleMiddleware([1]),
  cacheMiddleware(600), // 10 دقائق
  lineController.getLinePrices
);

// 🔹 إدارة الخطوط (للمسؤول فقط)
router.post("/", 
  authMiddleware, 
  roleMiddleware([2]),
  lineController.createLine
);

router.put("/:id", 
  authMiddleware, 
  roleMiddleware([2]),
  lineController.updateLine
);

router.patch("/:id/price", 
  authMiddleware, 
  roleMiddleware([2]),
  lineController.updateLinePrice
);

router.delete("/:id", 
  authMiddleware, 
  roleMiddleware([2]),
  lineController.deleteLine
);

module.exports = router;