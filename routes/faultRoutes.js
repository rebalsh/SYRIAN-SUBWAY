const express = require("express");
const router = express.Router();
const faultController = require("../controllers/faultController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ✅ الإبلاغ عن عطل جديد (للسائقين فقط - userType = 5)
router.post(
  "/report",
  authMiddleware,
  roleMiddleware([5]),
  faultController.reportFault
);

// ✅ الحصول على جميع الأعطال (للفنيين والمشرفين)
router.get(
  "/",
  authMiddleware,
  roleMiddleware([2, 3, 4]),
  faultController.getAllFaults
);

// ✅ الحصول على أعطال محطة محددة (للفنيين - userType = 4)
router.get(
  "/station",
  authMiddleware,
  roleMiddleware([4]),
  faultController.getStationFaults
);

// ✅ تحديث حالة العطل (للمشرفين والفنيين)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([2, 3, 4]),
  faultController.updateFaultStatus
);

module.exports = router;