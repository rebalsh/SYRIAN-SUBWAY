// const express = require("express");
// const router = express.Router();
// const trainController = require("../controllers/trainController");
// const authMiddleware = require("../middleware/authMiddleware");
// const roleMiddleware = require("../middleware/roleMiddleware");

// // ✅ إنشاء قطار جديد - للمشرف فقط (userType = 3)
// router.post(
//   "/",
//   authMiddleware,
//   roleMiddleware([2]),
//   trainController.createTrain
// );

// // ✅ الحصول على جميع القطارات - للمشرفين والاداريين
// router.get(
//   "/",
//   authMiddleware,
//   roleMiddleware([2, 3,5]),
//   trainController.getAllTrains
// );

// // ✅ الحصول على قطار بواسطة ID - للمشرفين والاداريين
// router.get(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2, 3,5]),
//   trainController.getTrainById
// );

// // ✅ تحديث بيانات القطار - للمشرف فقط
// router.put(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2]),
//   trainController.updateTrain
// );

// // ✅ حذف القطار - للمشرف فقط
// router.delete(
//   "/:id",
//   authMiddleware,
//   roleMiddleware([2]),
//   trainController.deleteTrain
// );

// module.exports = router;

const express = require("express");
const router = express.Router();
const trainController = require("../controllers/trainController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
// 🔴 أضف هذا السطر فقط
const cacheMiddleware = require("../middleware/cacheMiddleware");

// ✅ إنشاء قطار جديد - للمشرف فقط (userType = 2)
// 🔴 هنا ما نحتاج cacheMiddleware لأنها POST
router.post(
  "/",
  authMiddleware,
  roleMiddleware([2]),
  trainController.createTrain
);

// ✅ الحصول على جميع القطارات - للمشرفين والاداريين
// 🔴 أضف cacheMiddleware هنا
router.get(
  "/",
  authMiddleware,
  roleMiddleware([2, 3, 5]),
  cacheMiddleware(180), // 3 دقائق
  trainController.getAllTrains
);

// ✅ الحصول على قطار بواسطة ID - للمشرفين والاداريين
// 🔴 أضف cacheMiddleware هنا
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware([2, 3, 5]),
  cacheMiddleware(300), // 5 دقائق
  trainController.getTrainById
);

// ✅ تحديث بيانات القطار - للمشرف فقط
// 🔴 هنا ما نحتاج cacheMiddleware لأنها PUT
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware([2]),
  trainController.updateTrain
);

// ✅ حذف القطار - للمشرف فقط
// 🔴 هنا ما نحتاج cacheMiddleware لأنها DELETE
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([2]),
  trainController.deleteTrain
);

module.exports = router;