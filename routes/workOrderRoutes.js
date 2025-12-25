// const express = require("express");
// const router = express.Router();
// const workOrderController = require("../controllers/workOrderController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // ✅ إنشاء أمر عمل جديد (للمشرفين)
// router.post(
//   "/",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   workOrderController.createWorkOrder
// );

// // ✅ قبول/رفض أمر العمل (للفنيين فقط)
// router.put(
//   "/:id/respond",
//   authMiddleware,
//   roleMiddleware([4]),
//   workOrderController.respondToWorkOrder
// );

// // ✅ إكمال أمر العمل (للفنيين فقط)
// router.put(
//   "/:id/complete",
//   authMiddleware,
//   roleMiddleware([4]),
//   workOrderController.completeWorkOrder
// );

// // ✅ الحصول على أوامر العمل للفني
// router.get(
//   "/technician",
//   authMiddleware,
//   roleMiddleware([4]),
//   workOrderController.getTechnicianWorkOrders
// );

// // ✅ الحصول على جميع أوامر العمل (للمشرفين)
// router.get(
//   "/",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   workOrderController.getAllWorkOrders
// );

// module.exports = router;




const express = require("express");
const router = express.Router();
const workOrderController = require("../controllers/workOrderController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ============================================
// 🔧 للفنيين (userType = 4)
// ============================================

// ✅ الحصول على أوامر العمل للفني
router.get(
  "/technician",
  authMiddleware,
  roleMiddleware([4]),
  workOrderController.getTechnicianWorkOrders
);

// ✅ قبول/رفض أمر العمل
router.put(
  "/:id/respond",
  authMiddleware,
  roleMiddleware([4]),
  workOrderController.respondToWorkOrder
);

// ✅ إكمال أمر العمل
router.put(
  "/:id/complete",
  authMiddleware,
  roleMiddleware([4]),
  workOrderController.completeWorkOrder
);

// ============================================
// 👨‍💼 للمشرفين والإداريين (userType = 2, 3)
// ============================================

// ✅ إنشاء أمر عمل جديد
router.post(
  "/",
  authMiddleware,
  roleMiddleware([2, 3]),
  workOrderController.createWorkOrder
);

// ✅ الحصول على جميع أوامر العمل
router.get(
  "/",
  authMiddleware,
  roleMiddleware([2, 3]),
  workOrderController.getAllWorkOrders
);

module.exports = router;