const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 1. إنشاء جلسة دفع
router.post("/create-session",
  authMiddleware,
  roleMiddleware([1]),
  paymentController.createPaymentSession
);

// 2. تأكيد الدفع
router.post("/confirm",
  authMiddleware,
  roleMiddleware([1]),
  paymentController.confirmPayment
);

// 3. التحقق من حالة الدفع
router.get("/status",
  authMiddleware,
  roleMiddleware([1]),
  paymentController.checkPaymentStatus
);

module.exports = router;