// routes/lineRoutes.js
const express = require("express");
const router = express.Router();
const lineController = require("../controllers/lineController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 🔹 جميع المستخدمين يمكنهم رؤية الخطوط (مع مراعاة الصلاحيات)
router.get("/", authMiddleware, lineController.getAllLines);
router.get("/:id", authMiddleware, lineController.getLineById);

// 🔹 الأسعار للمسافرين فقط
router.get("/prices/all", 
  authMiddleware, 
  roleMiddleware([1]), // مسافرين فقط
  lineController.getLinePrices
);

// 🔹 فقط المسؤول (userType=2) يمكنه إدارة الخطوط
router.post("/", 
  authMiddleware, 
  roleMiddleware(1,[2]),
  lineController.createLine
);

router.put("/:id", 
  authMiddleware, 
  roleMiddleware([1,2]),
  lineController.updateLine
);

router.patch("/:id/price", 
  authMiddleware, 
  roleMiddleware([2]), // مسؤول فقط
  lineController.updateLinePrice
);

router.delete("/:id", 
  authMiddleware, 
  roleMiddleware([2]),
  lineController.deleteLine
);

module.exports = router;
// *************************************************************************

// const express = require("express");
// const router = express.Router();
// const lineController = require("../controllers/lineController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // 🔹 جميع المستخدمين يمكنهم رؤية الخطوط
// router.get("/", authMiddleware, lineController.getAllLines);
// router.get("/:id", authMiddleware, lineController.getLineById);

// // 🔹 فقط المسؤول (userType=2) يمكنه إدارة الخطوط
// router.post("/", 
//   authMiddleware, 
//   roleMiddleware([2]),
//   lineController.createLine
// );

// router.put("/:id", 
//   authMiddleware, 
//   roleMiddleware([2]),
//   lineController.updateLine
// );

// router.delete("/:id", 
//   authMiddleware, 
//   roleMiddleware([2]),
//   lineController.deleteLine
// );

// module.exports = router;