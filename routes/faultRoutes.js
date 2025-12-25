// const express = require("express");
// const router = express.Router();
// const faultController = require("../controllers/faultController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // ✅ الإبلاغ عن عطل جديد (للسائقين فقط - userType = 5)
// router.post(
//   "/report",
//   authMiddleware,
//   roleMiddleware([5]),
//   faultController.reportFault
// );

// // ✅ الحصول على جميع الأعطال (للفنيين والمشرفين)
// router.get(
//   "/",
//   authMiddleware,
//   roleMiddleware([2, 3, 4]),
//   faultController.getAllFaults
// );

// // ✅ الحصول على أعطال محطة محددة (للفنيين - userType = 4)
// router.get(
//   "/station",
//   authMiddleware,
//   roleMiddleware([4]),
//   faultController.getStationFaults
// );

// // ✅ تحديث حالة العطل (للمشرفين والفنيين)
// router.put(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2, 3, 4]),
//   faultController.updateFaultStatus
// );

// module.exports = router;









const express = require("express");
const router = express.Router();
const faultController = require("../controllers/faultController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ============================================
// 🚗 للمسافرين (userType = 5) - السائقين فقط
// ============================================

// ✅ الإبلاغ عن عطل جديد (للسائقين فقط)
router.post(
  "/report",
  authMiddleware,
  roleMiddleware([5]),
  faultController.reportFault
);

// ============================================
// 🔧 للفنيين (userType = 4)
// ============================================

// ✅ الحصول على الأعطال المتاحة للفني (جميع المحطات)
router.get(
  "/technician",
  authMiddleware,
  roleMiddleware([4]),
  faultController.getTechnicianFaults
);

// ✅ الفني يستلم عطل (يأخذه لنفسه)
router.put(
  "/:id/take",
  authMiddleware,
  roleMiddleware([4]),
  faultController.technicianTakeFault
);

// ✅ الفني يكمل إصلاح العطل
router.put(
  "/:id/complete",
  authMiddleware,
  roleMiddleware([4]),
  faultController.technicianCompleteFault
);

// ✅ الفني يتخلى عن عطل
router.put(
  "/:id/release",
  authMiddleware,
  roleMiddleware([4]),
  faultController.technicianReleaseFault
);

// ============================================
// 👨‍💼 للمشرفين والإداريين (userType = 2, 3)
// ============================================

// ✅ الحصول على جميع الأعطال (للمشرفين)
router.get(
  "/",
  authMiddleware,
  roleMiddleware([2, 3]),
  faultController.getAllFaults
);

// ✅ الحصول على الأعطال غير المعينة
router.get(
  "/unassigned",
  authMiddleware,
  roleMiddleware([2, 3]),
  faultController.getUnassignedFaults
);

// ✅ تعيين عطل لفني محدد
router.put(
  "/:id/assign",
  authMiddleware,
  roleMiddleware([2, 3]),
  faultController.assignFaultToTechnician
);

// ✅ تحديث حالة العطل (للمشرفين والفنيين)
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([2, 3, 4]),
  faultController.updateFaultStatus
);

module.exports = router;