// const express = require("express");
// const router = express.Router();
// const autoTripController = require("../controllers/autoTripController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // ✅ إنشاء رحلات أوتوماتيكية لمدة 30 يوم - للسوبر أدمن فقط
// router.post(
//   "/generate",
//   authMiddleware,
//   roleMiddleware([2]),
//   autoTripController.generateAutoTrips
// );

// // ✅ إدارة جدول الرحلات (تمكين/تعطيل أوقات) - للسوبر أدمن والمشرف
// router.post(
//   "/manage-schedule",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   autoTripController.manageTripSchedule
// );

// // ✅ جلب التقويم الشهري للرحلات - للجميع
// router.get(
//   "/monthly-calendar",
//   authMiddleware,
//   roleMiddleware([1, 2, 3, 4, 5]),
//   autoTripController.getMonthlyCalendar
// );


// module.exports = router;
















const express = require("express");
const router = express.Router();
const autoTripController = require("../controllers/autoTripController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ✅ إنشاء رحلات أوتوماتيكية مع تحديد يدوي - للسوبر أدمن فقط
router.post(
  "/generate",
  authMiddleware,
  roleMiddleware([2]),
  autoTripController.generateAutoTrips
);

// ✅ جلب القطارات المتاحة للاختيار - للسوبر أدمن والمشرف
router.get(
  "/available-trains",
  authMiddleware,
  roleMiddleware([2, 3]),
  autoTripController.getAvailableTrainsForSelection
);

// ✅ جلب السائقين المتاحين للاختيار - للسوبر أدمن والمشرف
router.get(
  "/available-drivers",
  authMiddleware,
  roleMiddleware([2, 3]),
  autoTripController.getAvailableDriversForSelection
);

// ✅ إدارة جدول الرحلات (تمكين/تعطيل أوقات) - للسوبر أدمن والمشرف
router.post(
  "/manage-schedule",
  authMiddleware,
  roleMiddleware([2, 3]),
  autoTripController.manageTripSchedule
);

// ✅ جلب التقويم الشهري للرحلات - للجميع
router.get(
  "/monthly-calendar",
  authMiddleware,
  roleMiddleware([1, 2, 3, 4, 5]),
  autoTripController.getMonthlyCalendar
);

// ✅ جلب إحصائيات الرحلات الأوتوماتيكية - للسوبر أدمن والمشرف
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware([2, 3]),
  autoTripController.getAutoTripsStats
);

// ✅ حذف الرحلات الأوتوماتيكية - للسوبر أدمن فقط
router.delete(
  "/delete",
  authMiddleware,
  roleMiddleware([2]),
  autoTripController.deleteAutoTrips
);

module.exports = router;