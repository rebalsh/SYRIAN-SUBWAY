// // // routes/ticketRoutes.js
// // const express = require("express");
// // const router = express.Router();
// // const ticketController = require("../controllers/ticketController");
// // const authMiddleware = require("../middleware/authMiddleware");
// // const roleMiddleware = require("../middleware/roleMiddleware");

// // // 🔹 الخطوط والرحلات المتاحة (للمسافرين فقط)
// // router.get("/lines", 
// //   authMiddleware, 
// //   roleMiddleware([1]),
// //   ticketController.getAvailableLines
// // );

// // router.get("/trips", 
// //   authMiddleware, 
// //   roleMiddleware([1]),
// //   ticketController.getAvailableTrips
// // );

// // // 🔹 عمليات الحجز (للمسافرين فقط)
// // router.post("/calculate-price",
// //   authMiddleware,
// //   roleMiddleware([1]),
// //   ticketController.calculatePrice
// // );

// // router.post("/book",
// //   authMiddleware,
// //   roleMiddleware([1]),
// //   ticketController.bookTickets
// // );

// // router.post("/confirm",
// //   authMiddleware,
// //   roleMiddleware([1]),
// //   ticketController.confirmBooking
// // );

// // // 🔹 إدارة التذاكر
// // router.get("/my-tickets",
// //   authMiddleware,
// //   roleMiddleware([1]),
// //   ticketController.getUserTickets
// // );

// // router.put("/cancel/:ticket_id",
// //   authMiddleware,
// //   roleMiddleware([1]),
// //   ticketController.cancelBooking
// // );

// // module.exports = router;


















const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// 🔹 الخطوط والرحلات المتاحة (للمسافرين فقط)
router.get("/lines", 
  authMiddleware, 
  roleMiddleware([1]),
  ticketController.getAvailableLines
);

router.get("/trips", 
  authMiddleware, 
  roleMiddleware([1]),
  ticketController.getAvailableTrips
);

// 🔹 عمليات الحجز (للمسافرين فقط)
router.post("/calculate-price",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.calculatePrice
);

router.post("/book",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.bookTickets
);

// 🔴 الإضافة الجديدة: حجز مع خصم
router.post("/book-with-discount",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.bookTicketWithDiscount
);

router.post("/confirm",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.confirmBooking
);

// 🔹 إدارة التذاكر
router.get("/my-tickets",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.getUserTickets
);

router.put("/cancel/:ticket_id",
  authMiddleware,
  roleMiddleware([1]),
  ticketController.cancelBooking
);

// 🔴 الإضافة الجديدة: تقارير الخصومات
router.get("/discount-reports",
  authMiddleware,
  roleMiddleware([2, 3]),
  ticketController.getDiscountReports
);

module.exports = router;






// const express = require('express');
// const router = express.Router();

// // تحميل الكونترولر والـ middleware
// const ticketController = require('../controllers/ticketController');
// const { authMiddleware } = require('../middleware/authMiddleware');
// const roleMiddleware = require('../middleware/roleMiddleware');

// // ✅ 1. جلب الخطوط المتاحة (للمسافرين فقط - اليوزر تايب 1)
// router.get("/available-lines",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.getAvailableLines
// );

// // ✅ 2. جلب الرحلات المتاحة لخط معين (للمسافرين فقط - اليوزر تايب 1)
// router.get("/available-trips",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.getAvailableTrips
// );

// // ✅ 3. جلب الرحلات العادية المتاحة (للمسافرين فقط - اليوزر تايب 1)
// router.get("/available-regular-trips",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.getAvailableRegularTrips
// );

// // ✅ 4. حساب السعر بناءً على المحطات (للمسافرين فقط - اليوزر تايب 1)
// router.post("/calculate-price",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.calculatePrice
// );

// // ✅ 5. حجز التذاكر العادية (للمسافرين فقط - اليوزر تايب 1)
// router.post("/book",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.bookTickets
// );

// // ✅ 6. حجز التذكرة العادية بنفس نظام الشهرية (للمسافرين فقط - اليوزر تايب 1)
// router.post("/book-regular",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.bookRegularTicket
// );

// // ✅ 7. حجز تذكرة مع خصم أسبوعي أو شهري (للمسافرين فقط - اليوزر تايب 1)
// router.post("/book-with-discount",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.bookTicketWithDiscount
// );

// // ✅ 8. تأكيد الحجز بعد الدفع (للمسافرين فقط - اليوزر تايب 1)
// router.post("/confirm-booking",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.confirmBooking
// );

// // ✅ 9. جلب تذاكر المستخدم (للمسافرين فقط - اليوزر تايب 1)
// router.get("/my-tickets",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.getUserTickets
// );

// // ✅ 10. جلب تذاكري العادية فقط (للمسافرين فقط - اليوزر تايب 1)
// router.get("/my-regular-tickets",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.getMyRegularTickets
// );

// // ✅ 11. إلغاء الحجز (للمسافرين فقط - اليوزر تايب 1)
// router.delete("/cancel/:ticket_id",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.cancelBooking
// );

// // ✅ 12. الدفع اليدوي للتذكرة العادية (للمسافرين فقط - اليوزر تايب 1)
// router.post("/manual-confirm-regular",
//   authMiddleware,
//   roleMiddleware([1]),
//   ticketController.manualConfirmRegularTicket
// );

// // ✅ 13. جلب QR Code للتذكرة (دالة مبسطة أولاً)
// router.get("/qr-code/:ticket_id",
//   authMiddleware,
//   roleMiddleware([1]),
//   (req, res) => {
//     res.json({
//       message: "QR Code endpoint is ready",
//       ticket_id: req.params.ticket_id,
//       status: "working",
//       note: "سيتم تطوير هذه الوظيفة بالكامل قريباً"
//     });
//   }
// );

// // 🔴 **الإضافة الجديدة: تقارير الخصومات (للسوبر أدمن والمشرفين فقط - اليوزر تايب 2 أو 3)**
// router.get("/discount-reports",
//   authMiddleware,
//   roleMiddleware([2, 3]),
//   ticketController.getDiscountReports
// );

// module.exports = router;