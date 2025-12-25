// 📁 routes/subscriptionRoutes.js
const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 🔹 حجز اشتراك أسبوعي/شهري
router.post("/book",
  authMiddleware,
  roleMiddleware([1]),
  subscriptionController.bookSubscription
);

// 🔹 تأكيد دفع الاشتراك
router.post("/confirm",
  authMiddleware,
  roleMiddleware([1]),
  subscriptionController.confirmSubscription
);

// 🔹 جلب اشتراكات المستخدم
router.get("/my-subscriptions",
  authMiddleware,
  roleMiddleware([1]),
  subscriptionController.getUserSubscriptions
);

module.exports = router;