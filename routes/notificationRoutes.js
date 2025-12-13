// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 🔹 إرسال الإشعارات (للمشرفين والسائقين والمسؤولين فقط)
router.post("/send/trip",
  authMiddleware,
  roleMiddleware([2, 3, 5]), // سوبر أدمن، مشرف، سائق
  notificationController.sendToTripPassengers
);

router.post("/send/all",
  authMiddleware,
  roleMiddleware([2, 3]), // سوبر أدمن، مشرف فقط
  notificationController.sendToAllPassengers
);

router.post("/send/date",
  authMiddleware,
  roleMiddleware([2, 3, 5]),
  notificationController.sendToDatePassengers
);

// 🔹 جلب الإشعارات (للمسافرين)
router.get("/my-notifications",
  authMiddleware,
  roleMiddleware([1]), // مسافرين فقط
  notificationController.getUserNotifications
);

router.put("/mark-read/:notification_id",
  authMiddleware,
  roleMiddleware([1]),
  notificationController.markAsRead
);

// 🔹 إحصائيات (للمشرفين)
router.get("/stats",
  authMiddleware,
  roleMiddleware([2, 3]),
  notificationController.getNotificationStats
);

module.exports = router;