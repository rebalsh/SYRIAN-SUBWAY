// routes/statsRoutes.js

const express = require("express");
const router = express.Router();
const statsController = require("../controllers/statsController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 🔹 جلب إحصائيات المستخدمين (للسوبر أدمن فقط)
router.get(
  "/users",
  authMiddleware,
  roleMiddleware([2]),
  statsController.getUserStats
);

// 🔹 جلب إحصائيات التذاكر (للسوبر أدمن والمشرفين)
router.get(
  "/tickets",
  authMiddleware,
  roleMiddleware([2, 3]),
  statsController.getTicketStats
);

// 🔹 جلب إحصائيات الرحلات (للسوبر أدمن والمشرفين)
router.get(
  "/trips",
  authMiddleware,
  roleMiddleware([2, 3]),
  statsController.getTripStats
);

// 🔹 جلب جميع الإحصائيات في API واحدة (للسوبر أدمن فقط)
router.get(
  "/all",
  authMiddleware,
  roleMiddleware([2]),
  statsController.getAllStats
);

module.exports = router;