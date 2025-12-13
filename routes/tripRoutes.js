// const express = require("express");
// const router = express.Router();
// const tripController = require("../controllers/tripController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // ✅ إنشاء رحلة جديدة - للمشرف فقط (userType = 2)
// router.post(
//   "/",
//   authMiddleware,
//   roleMiddleware([2]),
//   tripController.createTrip
// );

// // ✅ جلب جميع الرحلات - للمشرفين والاداريين والمسافرين
// router.get(
//   "/",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   tripController.getAllTrips
// );

// // ✅ جلب رحلة محددة - لجميع المستخدمين
// router.get(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([1, 2, 3]),
//   tripController.getTripById
// );

// // ✅ تحديث رحلة - للمشرف فقط
// router.put(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2]),
//   tripController.updateTrip
// );

// // ✅ تحديث حالة الرحلة - للمشرف والاداري
// router.patch(
//   "/:id/status",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.updateTripStatus
// );

// // ✅ حذف رحلة - للمشرف فقط
// router.delete(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2]),
//   tripController.deleteTrip
// );

// // ✅ جلب رحلات سائق معين - للمشرف والسائق نفسه
// router.get(
//   "/driver/:driver_id",
//   authMiddleware,
//   roleMiddleware([2, 4]),
//   tripController.getDriverTrips
// );

// module.exports = router;















// const express = require("express");
// const router = express.Router();
// const tripController = require("../controllers/tripController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // ✅ إنشاء رحلة جديدة - للسوبر أدمن والمشرف فقط (userType = 2, 3)
// router.post(
//   "/",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.createTrip
// );

// // ✅ جلب جميع الرحلات - لجميع المستخدمين المسموحين
// router.get(
//   "/",
//   authMiddleware,
//   roleMiddleware([1, 2, 3, 4, 5]),
//   tripController.getAllTrips
// );

// // ✅ جلب رحلة محددة - لجميع المستخدمين المسموحين
// router.get(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([1, 2, 3, 4, 5]),
//   tripController.getTripById
// );

// // ✅ تحديث رحلة - للسوبر أدمن والمشرف فقط
// router.put(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.updateTrip
// );

// // ✅ تحديث حالة الرحلة - للسوبر أدمن والمشرف
// router.patch(
//   "/:id/status",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.updateTripStatus
// );

// // ✅ حذف رحلة - للسوبر أدمن فقط
// router.delete(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2]),
//   tripController.deleteTrip
// );

// // ✅ جلب رحلات سائق معين - للسوبر أدمن والمشرف والسائق نفسه
// router.get(
//   "/driver/:driver_id",
//   authMiddleware,
//   roleMiddleware([2, 3, 4]),
//   tripController.getDriverTrips
// );

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const tripController = require("../controllers/tripController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // ✅ إنشاء رحلة جديدة - للسوبر أدمن والمشرف فقط (userType = 2, 3)
// router.post(
//   "/",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.createTrip
// );

// // ✅ جلب جميع الرحلات - لجميع المستخدمين المسموحين
// router.get(
//   "/",
//   authMiddleware,
//   roleMiddleware([1, 2, 3, 4, 5]),
//   tripController.getAllTrips
// );

// // ✅ جلب رحلة محددة - لجميع المستخدمين المسموحين
// router.get(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([1, 2, 3, 4, 5]),
//   tripController.getTripById
// );

// // ✅ تحديث رحلة - للسوبر أدمن والمشرف فقط
// router.put(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.updateTrip
// );

// // ✅ تحديث حالة الرحلة - للسوبر أدمن والمشرف
// router.patch(
//   "/:id/status",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.updateTripStatus
// );

// // ✅ حذف رحلة - للسوبر أدمن فقط
// router.delete(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2]),
//   tripController.deleteTrip
// );

// // ✅ جلب رحلات سائق معين - للسوبر أدمن والمشرف والسائق نفسه
// router.get(
//   "/driver/:driver_id",
//   authMiddleware,
//   roleMiddleware([2, 3, 5]),
//   tripController.getDriverTrips
// );

// // ✅ جلب رحلات السائق الحالي (للسائق نفسه)
// router.get(
//   "/my-trips/current",
//   authMiddleware,
//   roleMiddleware([5]),
//   tripController.getMyTrips
// );

// module.exports = router;








// ****************************************************************************************************************






// const express = require("express");
// const router = express.Router();
// const tripController = require("../controllers/tripController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // ✅ جلب السائقين المتاحين - للسوبر أدمن والمشرف فقط
// router.get(
//   "/available/drivers",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.getAvailableDrivers
// );

// // ✅ إنشاء رحلة جديدة - للسوبر أدمن والمشرف فقط (userType = 2, 3)
// router.post(
//   "/",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.createTrip
// );

// // ✅ جلب جميع الرحلات - لجميع المستخدمين المسموحين
// router.get(
//   "/",
//   authMiddleware,
//   roleMiddleware([1, 2, 3, 4, 5]),
//   tripController.getAllTrips
// );

// // ✅ جلب رحلة محددة - لجميع المستخدمين المسموحين
// router.get(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([1, 2, 3, 4, 5]),
//   tripController.getTripById
// );

// // ✅ تحديث رحلة - للسوبر أدمن والمشرف فقط
// router.put(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.updateTrip
// );

// // ✅ تحديث حالة الرحلة - للسوبر أدمن والمشرف
// router.patch(
//   "/:id/status",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   tripController.updateTripStatus
// );

// // ✅ حذف رحلة - للسوبر أدمن فقط
// router.delete(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2]),
//   tripController.deleteTrip
// );

// // ✅ جلب رحلات سائق معين - للسوبر أدمن والمشرف والسائق نفسه
// router.get(
//   "/driver/:driver_id",
//   authMiddleware,
//   roleMiddleware([2, 3, 5]),
//   tripController.getDriverTrips
// );

// // ✅ جلب رحلات السائق الحالي (للسائق نفسه)
// router.get(
//   "/my-trips/current",
//   authMiddleware,
//   roleMiddleware([5]),
//   tripController.getMyTrips
// );

// module.exports = router;






// ****************************************************************************************************************









const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// ✅ جلب السائقين المتاحين - للسوبر أدمن والمشرف فقط
router.get(
  "/available/drivers",
  authMiddleware,
  roleMiddleware([2, 3]),
  tripController.getAvailableDrivers
);

// ✅ جلب الخطوط المتاحة - للسوبر أدمن والمشرف فقط (إضافة جديدة)
router.get(
  "/available/lines",
  authMiddleware,
  roleMiddleware([2, 3]),
  tripController.getAvailableLines
);

// ✅ إنشاء رحلة جديدة - للسوبر أدمن والمشرف فقط (userType = 2, 3)
router.post(
  "/",
  authMiddleware,
  roleMiddleware([2, 3]),
  tripController.createTrip
);

// ✅ جلب جميع الرحلات - لجميع المستخدمين المسموحين
router.get(
  "/",
  authMiddleware,
  roleMiddleware([1, 2, 3, 4, 5]),
  tripController.getAllTrips
);

// ✅ جلب رحلة محددة - لجميع المستخدمين المسموحين
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware([1, 2, 3, 4, 5]),
  tripController.getTripById
);

// ✅ تحديث رحلة - للسوبر أدمن والمشرف فقط
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([2, 3]),
  tripController.updateTrip
);

// ✅ تحديث حالة الرحلة - للسوبر أدمن والمشرف
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware([2, 3]),
  tripController.updateTripStatus
);

// ✅ حذف رحلة - للسوبر أدمن فقط
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([2]),
  tripController.deleteTrip
);

// ✅ جلب رحلات سائق معين - للسوبر أدمن والمشرف والسائق نفسه
router.get(
  "/driver/:driver_id",
  authMiddleware,
  roleMiddleware([2, 3, 5]),
  tripController.getDriverTrips
);

// ✅ جلب رحلات السائق الحالي (للسائق نفسه)
router.get(
  "/my-trips/current",
  authMiddleware,
  roleMiddleware([5]),
  tripController.getMyTrips
);

module.exports = router;